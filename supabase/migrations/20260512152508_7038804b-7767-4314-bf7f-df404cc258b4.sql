
-- 1) Link columns
ALTER TABLE public.finance_invoices ADD COLUMN IF NOT EXISTS consignment_id uuid;
ALTER TABLE public.finance_expenses ADD COLUMN IF NOT EXISTS consignment_id uuid;
ALTER TABLE public.cargo_receipts ADD COLUMN IF NOT EXISTS consignment_id uuid;
ALTER TABLE public.client_shipments ADD COLUMN IF NOT EXISTS consignment_id uuid;
ALTER TABLE public.client_shipments ADD COLUMN IF NOT EXISTS tracking_link text;

CREATE TABLE IF NOT EXISTS public.trucking_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_ref text,
  consignment_id uuid,
  consignment_ref text,
  driver_id uuid,
  truck_id uuid,
  origin text,
  destination text,
  status text NOT NULL DEFAULT 'pending',
  tracking_link text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trucking_jobs ADD COLUMN IF NOT EXISTS consignment_id uuid;
ALTER TABLE public.trucking_jobs ADD COLUMN IF NOT EXISTS tracking_link text;
ALTER TABLE public.trucking_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trucking_jobs' AND policyname='Staff manage trucking jobs') THEN
    CREATE POLICY "Staff manage trucking jobs" ON public.trucking_jobs FOR ALL USING (NOT is_client(auth.uid())) WITH CHECK (NOT is_client(auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_finance_invoices_consignment ON public.finance_invoices(consignment_id);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_consignment ON public.finance_expenses(consignment_id);
CREATE INDEX IF NOT EXISTS idx_trucking_jobs_consignment ON public.trucking_jobs(consignment_id);
CREATE INDEX IF NOT EXISTS idx_cargo_receipts_consignment ON public.cargo_receipts(consignment_id);
CREATE INDEX IF NOT EXISTS idx_client_shipments_consignment ON public.client_shipments(consignment_id);

-- 2) Events bus
CREATE TABLE IF NOT EXISTS public.consignment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id uuid,
  consignment_ref text,
  event_type text NOT NULL,
  source_department text,
  payload jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consignment_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='consignment_events' AND policyname='Staff view events') THEN
    CREATE POLICY "Staff view events" ON public.consignment_events FOR SELECT USING (NOT is_client(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='consignment_events' AND policyname='System insert events') THEN
    CREATE POLICY "System insert events" ON public.consignment_events FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_consignment ON public.consignment_events(consignment_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON public.consignment_events(created_at DESC);

-- 3) Notification helper (reuses existing notifications table)
CREATE OR REPLACE FUNCTION public.notify_department(
  _department text, _type text, _title text, _body text, _link text,
  _consignment_id uuid, _consignment_ref text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, recipient_department, type, category, priority, title, message, action_url, reference_id, reference_type, metadata)
  SELECT p.user_id, _department, _type, 'workflow', 'medium', _title, _body, _link,
         _consignment_id::text, 'consignment',
         jsonb_build_object('consignment_ref', _consignment_ref)
  FROM public.profiles p
  WHERE p.is_active = true
    AND (_department = 'all' OR p.department::text = _department);
END;
$$;

-- 4) Document uploaded trigger
CREATE OR REPLACE FUNCTION public.fn_on_document_uploaded()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.consignment_workflows;
BEGIN
  SELECT * INTO w FROM public.consignment_workflows WHERE id = NEW.consignment_id;
  IF FOUND THEN
    IF w.documents_received_at IS NULL THEN
      UPDATE public.consignment_workflows
        SET documents_received_at = now(), current_stage = 'documents_received', updated_at = now()
        WHERE id = NEW.consignment_id;
    END IF;
    INSERT INTO public.consignment_events(consignment_id, consignment_ref, event_type, source_department, payload, actor_id)
      VALUES (w.id, w.consignment_ref, 'document_uploaded', 'documentation',
              jsonb_build_object('document_id', NEW.id, 'name', NEW.document_name), auth.uid());
    PERFORM public.notify_department('operations', 'document_uploaded',
      'New document for ' || w.consignment_ref,
      coalesce(NEW.document_name, 'Document') || ' uploaded',
      '/consignments', w.id, w.consignment_ref);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_doc_uploaded ON public.consignment_documents;
CREATE TRIGGER trg_doc_uploaded AFTER INSERT ON public.consignment_documents
FOR EACH ROW EXECUTE FUNCTION public.fn_on_document_uploaded();

-- 5) Workflow stage change trigger
CREATE OR REPLACE FUNCTION public.fn_on_workflow_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv_no text;
BEGIN
  IF NEW.current_stage IS DISTINCT FROM OLD.current_stage THEN
    INSERT INTO public.consignment_events(consignment_id, consignment_ref, event_type, source_department, payload, actor_id)
      VALUES (NEW.id, NEW.consignment_ref, 'stage_changed', 'operations',
              jsonb_build_object('from', OLD.current_stage, 'to', NEW.current_stage), auth.uid());

    IF NEW.current_stage = 'documentation_completed'
       AND NOT EXISTS (SELECT 1 FROM public.finance_invoices WHERE consignment_id = NEW.id) THEN
      inv_no := 'INV-' || to_char(now(),'YYYYMM') || '-' || substr(replace(NEW.id::text,'-',''),1,6);
      INSERT INTO public.finance_invoices(invoice_number, customer_id, customer, consignment_id, shipment_ref,
                                          currency, subtotal, tax_amount, total_amount, ghs_equivalent,
                                          status, issue_date, description)
        VALUES (inv_no, coalesce(NEW.client_id::text,''), NEW.client_name, NEW.id, NEW.consignment_ref,
                'GHS', 0, 0, 0, 0, 'draft', CURRENT_DATE,
                'Auto-draft for ' || NEW.consignment_ref);
      PERFORM public.notify_department('accounts','invoice_draft_created',
        'Draft invoice for ' || NEW.consignment_ref,
        'Documentation completed — invoice ' || inv_no || ' created',
        '/finance', NEW.id, NEW.consignment_ref);
    END IF;

    IF NEW.current_stage = 'cargo_released'
       AND NOT EXISTS (SELECT 1 FROM public.trucking_jobs WHERE consignment_id = NEW.id) THEN
      INSERT INTO public.trucking_jobs(job_ref, consignment_id, consignment_ref, origin, destination, status)
        VALUES ('TRK-' || substr(replace(NEW.id::text,'-',''),1,8),
                NEW.id, NEW.consignment_ref, coalesce(NEW.terminal,'Tema Port'),
                'Client warehouse', 'pending');
      PERFORM public.notify_department('operations','trucking_job_created',
        'Trucking job ready for ' || NEW.consignment_ref,
        'Assign driver and truck',
        '/trucking', NEW.id, NEW.consignment_ref);
    END IF;

    IF NEW.current_stage = 'delivery_completed' THEN
      PERFORM public.notify_department('all','delivery_completed',
        'Delivery completed: ' || NEW.consignment_ref, NULL,
        '/consignments', NEW.id, NEW.consignment_ref);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_workflow_stage ON public.consignment_workflows;
CREATE TRIGGER trg_workflow_stage AFTER UPDATE ON public.consignment_workflows
FOR EACH ROW EXECUTE FUNCTION public.fn_on_workflow_stage_change();

-- 6) Invoice paid trigger
CREATE OR REPLACE FUNCTION public.fn_on_invoice_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') AND NEW.consignment_id IS NOT NULL THEN
    INSERT INTO public.consignment_events(consignment_id, event_type, source_department, payload, actor_id)
      VALUES (NEW.consignment_id, 'invoice_paid', 'accounts',
              jsonb_build_object('invoice_id', NEW.id, 'amount', NEW.total_amount), auth.uid());
    UPDATE public.consignment_workflows
      SET current_stage = CASE WHEN current_stage IN ('delivery_started','delivery_completed','cargo_released')
                                THEN current_stage ELSE 'cargo_released' END,
          cargo_released_at = COALESCE(cargo_released_at, now()),
          updated_at = now()
      WHERE id = NEW.consignment_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_invoice_paid ON public.finance_invoices;
CREATE TRIGGER trg_invoice_paid AFTER UPDATE ON public.finance_invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_on_invoice_paid();

-- 7) Trucking status trigger
CREATE OR REPLACE FUNCTION public.fn_on_trucking_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.consignment_workflows; link text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.consignment_id IS NOT NULL THEN
    SELECT * INTO w FROM public.consignment_workflows WHERE id = NEW.consignment_id;
    IF NEW.status = 'in_transit' THEN
      link := '/track/' || coalesce(w.consignment_ref, NEW.consignment_ref);
      UPDATE public.trucking_jobs SET tracking_link = link, started_at = COALESCE(started_at, now()) WHERE id = NEW.id;
      UPDATE public.consignment_workflows SET delivery_started_at = COALESCE(delivery_started_at, now()),
        current_stage = CASE WHEN current_stage = 'delivery_completed' THEN current_stage ELSE 'delivery_started' END,
        updated_at = now() WHERE id = NEW.consignment_id;
      INSERT INTO public.consignment_events(consignment_id, consignment_ref, event_type, source_department, payload)
        VALUES (NEW.consignment_id, w.consignment_ref, 'trip_started', 'fleet', jsonb_build_object('tracking_link', link));
      PERFORM public.notify_department('all','trip_started',
        'Trip started for ' || w.consignment_ref, 'Tracking link: ' || link, link,
        NEW.consignment_id, w.consignment_ref);
    ELSIF NEW.status = 'completed' THEN
      UPDATE public.consignment_workflows SET delivery_completed_at = now(),
        current_stage = 'delivery_completed', updated_at = now() WHERE id = NEW.consignment_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_trucking_status ON public.trucking_jobs;
CREATE TRIGGER trg_trucking_status AFTER UPDATE ON public.trucking_jobs
FOR EACH ROW EXECUTE FUNCTION public.fn_on_trucking_status_change();

-- 8) Realtime publication
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.consignment_workflows; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.consignment_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_invoices; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.trucking_jobs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.cargo_receipts; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
