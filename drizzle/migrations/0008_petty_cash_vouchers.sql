ALTER TABLE public.expense_vouchers ADD COLUMN voucher_type text NOT NULL DEFAULT 'expense' CHECK (voucher_type IN ('expense','petty_cash'));
CREATE SEQUENCE IF NOT EXISTS public.petty_cash_voucher_seq;
GRANT USAGE ON SEQUENCE public.petty_cash_voucher_seq TO authenticated;
CREATE OR REPLACE FUNCTION public.expense_voucher_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.status := 'submitted';
  NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.review_note := NULL;
  NEW.submitted_by := auth.uid();
  IF NEW.voucher_type = 'petty_cash' THEN
    NEW.payment_method := 'cash';
    NEW.voucher_no := 'SLAC/PCV/' || to_char(now() AT TIME ZONE 'Africa/Accra','YYYY') || '/' || lpad(nextval('public.petty_cash_voucher_seq')::text, 4, '0');
  ELSE
    NEW.voucher_no := 'SLAC/EV/' || to_char(now() AT TIME ZONE 'Africa/Accra','YYYY') || '/' || lpad(nextval('public.expense_voucher_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END $$;