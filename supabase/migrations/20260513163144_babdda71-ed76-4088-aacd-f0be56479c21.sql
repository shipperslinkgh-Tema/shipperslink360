
-- Realtime for client_invoices and notifications (notifications already in publication; ignore errors)
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.client_invoices';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper to insert a notification for the client user behind a customer_id
CREATE OR REPLACE FUNCTION public.notify_client(
  _customer_id text,
  _type text,
  _category text,
  _priority text,
  _title text,
  _message text,
  _action_url text,
  _reference_id text,
  _reference_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE _uid uuid;
BEGIN
  SELECT user_id INTO _uid FROM public.client_profiles
    WHERE customer_id = _customer_id AND is_active = true LIMIT 1;
  IF _uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.notifications (recipient_id, type, category, priority, title, message, action_url, reference_id, reference_type)
    VALUES (_uid, _type, _category, _priority, _title, _message, _action_url, _reference_id, _reference_type);
END;
$fn$;

-- Trigger: notify client on new invoice
CREATE OR REPLACE FUNCTION public.fn_notify_client_invoice_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.notify_client(
    NEW.customer_id, 'info', 'finance', 'medium',
    'New invoice issued: ' || NEW.invoice_number,
    'Amount: ' || NEW.currency || ' ' || NEW.amount::text || ' — Due ' || NEW.due_date::text,
    '/portal/financials',
    NEW.id::text, 'invoice'
  );
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_client_invoice_created ON public.client_invoices;
CREATE TRIGGER trg_client_invoice_created
AFTER INSERT ON public.client_invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_client_invoice_created();

-- Trigger: notify client on payment received
CREATE OR REPLACE FUNCTION public.fn_notify_client_invoice_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE _delta numeric;
BEGIN
  _delta := COALESCE(NEW.paid_amount,0) - COALESCE(OLD.paid_amount,0);
  IF _delta > 0 THEN
    PERFORM public.notify_client(
      NEW.customer_id, 'success', 'finance', 'medium',
      'Payment received for ' || NEW.invoice_number,
      NEW.currency || ' ' || _delta::text || ' applied. New balance: ' || (NEW.amount - NEW.paid_amount)::text,
      '/portal/financials',
      NEW.id::text, 'invoice'
    );
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_client_invoice_paid ON public.client_invoices;
CREATE TRIGGER trg_client_invoice_paid
AFTER UPDATE OF paid_amount ON public.client_invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_client_invoice_paid();

-- Trigger: notify client on shipment status change
CREATE OR REPLACE FUNCTION public.fn_notify_client_shipment_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE _label text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    _label := CASE NEW.status
      WHEN 'in_transit' THEN 'In Transit — Track live'
      WHEN 'at_port' THEN 'Arrived at Port'
      WHEN 'customs_clearance' THEN 'In Customs Clearance'
      WHEN 'delivered' THEN 'Delivered'
      WHEN 'on_hold' THEN 'On Hold'
      ELSE NEW.status
    END;
    PERFORM public.notify_client(
      NEW.customer_id,
      CASE WHEN NEW.status='delivered' THEN 'success'
           WHEN NEW.status='on_hold' THEN 'warning' ELSE 'info' END,
      'shipment',
      CASE WHEN NEW.status='on_hold' THEN 'high' ELSE 'medium' END,
      'Shipment ' || NEW.bl_number || ': ' || _label,
      NEW.origin || ' → ' || NEW.destination,
      CASE WHEN NEW.status='in_transit' AND NEW.tracking_link IS NOT NULL THEN NEW.tracking_link
           ELSE '/portal/shipments' END,
      NEW.id::text, 'shipment'
    );
  END IF;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_client_shipment_status ON public.client_shipments;
CREATE TRIGGER trg_client_shipment_status
AFTER UPDATE OF status ON public.client_shipments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_client_shipment_status();
