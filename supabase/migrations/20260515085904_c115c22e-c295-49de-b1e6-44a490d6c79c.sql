
CREATE TABLE public.client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  invoice_id uuid REFERENCES public.client_invoices(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'GHS',
  paid_date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'bank_transfer',
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_payments_customer ON public.client_payments(customer_id);
CREATE INDEX idx_client_payments_invoice ON public.client_payments(invoice_id);

ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage client payments"
ON public.client_payments FOR ALL
USING (is_admin(auth.uid()) OR (NOT is_client(auth.uid())))
WITH CHECK (is_admin(auth.uid()) OR (NOT is_client(auth.uid())));

CREATE POLICY "Clients can view own payments"
ON public.client_payments FOR SELECT
USING (customer_id = get_client_customer_id(auth.uid()));

CREATE TRIGGER set_client_payments_updated_at
BEFORE UPDATE ON public.client_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply payment to invoice and notify client
CREATE OR REPLACE FUNCTION public.fn_apply_client_payment()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  inv public.client_invoices;
  new_paid numeric;
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT * INTO inv FROM public.client_invoices WHERE id = NEW.invoice_id FOR UPDATE;
    IF FOUND THEN
      new_paid := COALESCE(inv.paid_amount, 0) + NEW.amount;
      UPDATE public.client_invoices
        SET paid_amount = new_paid,
            paid_date = NEW.paid_date,
            status = CASE WHEN new_paid >= inv.amount THEN 'paid' ELSE 'partially_paid' END,
            updated_at = now()
        WHERE id = NEW.invoice_id;
    END IF;
  END IF;

  PERFORM public.notify_client(
    NEW.customer_id, 'success', 'finance', 'medium',
    'Payment received: ' || NEW.currency || ' ' || NEW.amount::text,
    COALESCE('Reference: ' || NEW.reference, 'Recorded on ' || NEW.paid_date::text),
    '/portal/financials',
    NEW.id::text, 'payment'
  );
  RETURN NEW;
END $$;

CREATE TRIGGER trg_apply_client_payment
AFTER INSERT ON public.client_payments
FOR EACH ROW EXECUTE FUNCTION public.fn_apply_client_payment();

-- Triggers for invoice notifications (if not yet attached)
DROP TRIGGER IF EXISTS trg_notify_client_invoice_created ON public.client_invoices;
CREATE TRIGGER trg_notify_client_invoice_created
AFTER INSERT ON public.client_invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_client_invoice_created();
