
-- =========================================
-- 1) STRICT LIFECYCLE ENFORCEMENT
-- =========================================
CREATE OR REPLACE FUNCTION public.enforce_trip_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old text;
  v_new text;
  v_allowed boolean := false;
BEGIN
  v_old := COALESCE(OLD.status, 'scheduled');
  v_new := NEW.status;

  IF v_old = v_new THEN
    RETURN NEW;
  END IF;

  -- allowed transitions
  v_allowed := CASE
    WHEN v_old = 'scheduled'  AND v_new IN ('in_transit','cancelled') THEN true
    WHEN v_old = 'in_transit' AND v_new IN ('delivered','cancelled')  THEN true
    WHEN v_old = 'delivered'  AND v_new IN ('completed')              THEN true
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid trip status transition: % -> %', v_old, v_new
      USING ERRCODE = 'check_violation';
  END IF;

  -- gates
  IF v_new = 'in_transit' AND NEW.actual_start_time IS NULL THEN
    NEW.actual_start_time := now();
  END IF;

  IF v_new = 'delivered' THEN
    IF COALESCE(NEW.pod_url,'') = ''
       AND COALESCE(NEW.delivery_confirmed_by,'') = ''
       AND COALESCE(NEW.delivery_otp,'') = '' THEN
      RAISE EXCEPTION 'Cannot mark trip delivered without proof (POD photo, signature or OTP)'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.actual_end_time IS NULL THEN
      NEW.actual_end_time := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_trip_lifecycle ON public.trucking_trips;
CREATE TRIGGER trg_enforce_trip_lifecycle
BEFORE UPDATE OF status ON public.trucking_trips
FOR EACH ROW
EXECUTE FUNCTION public.enforce_trip_lifecycle();

-- =========================================
-- 2) AUTO-ACCOUNTING ON COMPLETION
-- =========================================
CREATE OR REPLACE FUNCTION public.gen_expense_ref()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'EXP-TRIP-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);
$$;

CREATE OR REPLACE FUNCTION public.auto_post_trip_expenses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already int;
BEGIN
  IF NEW.status <> 'completed' OR COALESCE(OLD.status,'') = 'completed' THEN
    RETURN NEW;
  END IF;

  -- idempotency: skip if already posted for this trip
  SELECT COUNT(*) INTO v_already
  FROM public.finance_expenses
  WHERE notes LIKE 'AUTO:TRIP:' || NEW.id::text || '%';
  IF v_already > 0 THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.fuel_cost,0) > 0 THEN
    INSERT INTO public.finance_expenses(expense_ref, category, description, amount, currency, ghs_equivalent, status, expense_date, consignment_id, notes, requested_by)
    VALUES (gen_expense_ref(),'fuel','Trip fuel: '||COALESCE(NEW.origin,'')||' → '||COALESCE(NEW.destination,''), NEW.fuel_cost,'GHS',NEW.fuel_cost,'approved',CURRENT_DATE,NEW.consignment_id,'AUTO:TRIP:'||NEW.id::text||':fuel','System (Auto)');
  END IF;
  IF COALESCE(NEW.driver_payment,0) > 0 THEN
    INSERT INTO public.finance_expenses(expense_ref, category, description, amount, currency, ghs_equivalent, status, expense_date, consignment_id, notes, requested_by)
    VALUES (gen_expense_ref(),'driver','Driver payment: '||COALESCE(NEW.driver_name,''), NEW.driver_payment,'GHS',NEW.driver_payment,'approved',CURRENT_DATE,NEW.consignment_id,'AUTO:TRIP:'||NEW.id::text||':driver','System (Auto)');
  END IF;
  IF COALESCE(NEW.toll_cost,0) > 0 THEN
    INSERT INTO public.finance_expenses(expense_ref, category, description, amount, currency, ghs_equivalent, status, expense_date, consignment_id, notes, requested_by)
    VALUES (gen_expense_ref(),'tolls','Trip tolls', NEW.toll_cost,'GHS',NEW.toll_cost,'approved',CURRENT_DATE,NEW.consignment_id,'AUTO:TRIP:'||NEW.id::text||':tolls','System (Auto)');
  END IF;
  IF COALESCE(NEW.misc_cost,0) > 0 THEN
    INSERT INTO public.finance_expenses(expense_ref, category, description, amount, currency, ghs_equivalent, status, expense_date, consignment_id, notes, requested_by)
    VALUES (gen_expense_ref(),'other','Trip misc expense', NEW.misc_cost,'GHS',NEW.misc_cost,'approved',CURRENT_DATE,NEW.consignment_id,'AUTO:TRIP:'||NEW.id::text||':misc','System (Auto)');
  END IF;

  -- notify accounts
  INSERT INTO public.notifications(title, message, type, category, priority, recipient_department, reference_id, reference_type, action_url, metadata)
  VALUES (
    'Trip expenses auto-posted',
    'Trip '||COALESCE(NEW.truck_number,NEW.id::text)||' completed. Expenses posted to accounts.',
    'success','accounting','medium','accounts',
    NEW.id::text,'trucking_trip','/accounts/expenses',
    jsonb_build_object('trip_id',NEW.id,'consignment_id',NEW.consignment_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_post_trip_expenses ON public.trucking_trips;
CREATE TRIGGER trg_auto_post_trip_expenses
AFTER UPDATE OF status ON public.trucking_trips
FOR EACH ROW
EXECUTE FUNCTION public.auto_post_trip_expenses();

-- =========================================
-- 3) SMART ALERTS (in-app)
-- =========================================
CREATE OR REPLACE FUNCTION public.scan_trip_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t RECORD;
  v_last_ping timestamptz;
  v_eta_target timestamptz;
  v_dedup int;
BEGIN
  FOR t IN
    SELECT id, truck_number, origin, destination, actual_start_time, route_eta_seconds, estimated_delivery_time, consignment_id
    FROM public.trucking_trips
    WHERE status = 'in_transit'
  LOOP
    -- DELAY: actual_start_time + ETA + 30min < now
    v_eta_target := COALESCE(
      t.estimated_delivery_time,
      t.actual_start_time + make_interval(secs => COALESCE(t.route_eta_seconds,0))
    );

    IF v_eta_target IS NOT NULL AND now() > v_eta_target + interval '30 minutes' THEN
      SELECT COUNT(*) INTO v_dedup FROM public.notifications
      WHERE reference_id = t.id::text
        AND reference_type = 'trucking_trip'
        AND category = 'trucking_delay'
        AND created_at > now() - interval '24 hours';
      IF v_dedup = 0 THEN
        INSERT INTO public.notifications(title, message, type, category, priority, recipient_department, reference_id, reference_type, action_url, metadata)
        VALUES (
          'Trip delayed',
          'Trip '||COALESCE(t.truck_number,t.id::text)||' ('||t.origin||' → '||t.destination||') is overdue by 30+ minutes.',
          'warning','trucking_delay','high','trucking',
          t.id::text,'trucking_trip','/trucking',
          jsonb_build_object('trip_id',t.id,'eta_target',v_eta_target)
        );
      END IF;
    END IF;

    -- OFFLINE: last GPS log older than 10 min
    SELECT MAX(timestamp) INTO v_last_ping FROM public.trip_gps_logs WHERE trip_id = t.id;
    IF (v_last_ping IS NULL AND t.actual_start_time < now() - interval '10 minutes')
       OR (v_last_ping IS NOT NULL AND v_last_ping < now() - interval '10 minutes') THEN
      SELECT COUNT(*) INTO v_dedup FROM public.notifications
      WHERE reference_id = t.id::text
        AND reference_type = 'trucking_trip'
        AND category = 'trucking_offline'
        AND created_at > now() - interval '24 hours';
      IF v_dedup = 0 THEN
        INSERT INTO public.notifications(title, message, type, category, priority, recipient_department, reference_id, reference_type, action_url, metadata)
        VALUES (
          'Truck GPS offline',
          'Trip '||COALESCE(t.truck_number,t.id::text)||' has had no GPS update for 10+ minutes.',
          'error','trucking_offline','high','trucking',
          t.id::text,'trucking_trip','/trucking',
          jsonb_build_object('trip_id',t.id,'last_ping',v_last_ping)
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- schedule via pg_cron every 5 minutes
DO $$
BEGIN
  PERFORM cron.unschedule('scan_trip_alerts_5m');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('scan_trip_alerts_5m', '*/5 * * * *', $$SELECT public.scan_trip_alerts();$$);
