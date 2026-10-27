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
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id)
    VALUES (auth.uid(), 'expense_voucher_' || _decision, 'expense_vouchers', _id::text);
END $$;