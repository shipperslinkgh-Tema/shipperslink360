CREATE SEQUENCE IF NOT EXISTS public.expense_voucher_seq;

CREATE TABLE public.expense_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no text UNIQUE,
  voucher_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Africa/Accra')::date,
  job_ref text,
  paid_to text NOT NULL,
  account_no text,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('bank_transfer','mobile_money','cash','bank_cheque')),
  category text NOT NULL CHECK (category IN ('shipping_line','customs_duty','port_gpha','office','transport','other')),
  category_other text,
  description text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_amount > 0),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected')),
  submitted_by uuid NOT NULL DEFAULT auth.uid(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.expense_vouchers TO authenticated;
GRANT ALL ON public.expense_vouchers TO service_role;
GRANT USAGE ON SEQUENCE public.expense_voucher_seq TO authenticated;
ALTER TABLE public.expense_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff submit own expense vouchers" ON public.expense_vouchers
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND status = 'submitted' AND NOT public.is_client(auth.uid()));

CREATE POLICY "View own or accounts views all" ON public.expense_vouchers
  FOR SELECT TO authenticated
  USING (submitted_by = auth.uid() OR public.is_accounts(auth.uid()));

CREATE OR REPLACE FUNCTION public.expense_voucher_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.status := 'submitted';
  NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.review_note := NULL;
  NEW.submitted_by := auth.uid();
  NEW.voucher_no := 'SLAC/EV/' || to_char(now() AT TIME ZONE 'Africa/Accra','YYYY') || '/' || lpad(nextval('public.expense_voucher_seq')::text, 4, '0');
  RETURN NEW;
END $$;

CREATE TRIGGER expense_voucher_before_insert BEFORE INSERT ON public.expense_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.expense_voucher_before_insert();

CREATE OR REPLACE FUNCTION public.expense_voucher_review(_id uuid, _decision text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.expense_vouchers;
BEGIN
  IF NOT public.is_accounts(auth.uid()) THEN RAISE EXCEPTION 'Only Accounts can review expense vouchers'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT * INTO v FROM public.expense_vouchers WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Voucher not found'; END IF;
  IF v.status <> 'submitted' THEN RAISE EXCEPTION 'Voucher already reviewed'; END IF;
  IF v.submitted_by = auth.uid() THEN RAISE EXCEPTION 'You cannot approve your own voucher'; END IF;
  UPDATE public.expense_vouchers SET status = _decision, reviewed_by = auth.uid(), reviewed_at = now(),
    review_note = nullif(trim(_note),''), updated_at = now() WHERE id = _id;
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id)
    VALUES (auth.uid(), 'expense_voucher_' || _decision, 'expense_vouchers', _id::text);
END $$;

REVOKE ALL ON FUNCTION public.expense_voucher_review(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expense_voucher_review(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.expense_voucher_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_department('accounts', 'approval', 'Expense voucher awaiting approval',
    NEW.voucher_no || ' submitted for review', '/expense-vouchers', NULL, NULL);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE TRIGGER expense_voucher_notify AFTER INSERT ON public.expense_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.expense_voucher_notify();