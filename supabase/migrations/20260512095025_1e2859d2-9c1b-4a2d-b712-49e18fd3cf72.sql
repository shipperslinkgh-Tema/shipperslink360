
-- ============================================================
-- ACCOUNTS PORTAL — Voucher-based double-entry accounting
-- ============================================================

-- Helper: is accounts/admin
CREATE OR REPLACE FUNCTION public.is_accounts(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin'))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND department IN ('accounts','management'))
$$;

-- ---------- chart_of_accounts ----------
CREATE TABLE public.chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
  parent_id uuid REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'GHS',
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view COA" ON public.chart_of_accounts FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Accounts manage COA" ON public.chart_of_accounts FOR ALL USING (is_accounts(auth.uid())) WITH CHECK (is_accounts(auth.uid()));

CREATE TRIGGER coa_updated BEFORE UPDATE ON public.chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- vouchers ----------
CREATE TABLE public.vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no text UNIQUE,
  voucher_type text NOT NULL CHECK (voucher_type IN ('payment','receipt','journal','contra')),
  voucher_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','cancelled')),
  reference text,
  narration text,
  party_name text,
  payment_method text,
  consignment_id uuid,
  customer_id text,
  invoice_id uuid,
  bank_connection_id uuid,
  currency text NOT NULL DEFAULT 'GHS',
  exchange_rate numeric NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  ghs_equivalent numeric NOT NULL DEFAULT 0,
  posted_at timestamptz,
  posted_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_vouchers_date ON public.vouchers(voucher_date);
CREATE INDEX idx_vouchers_consignment ON public.vouchers(consignment_id);
CREATE INDEX idx_vouchers_customer ON public.vouchers(customer_id);
CREATE INDEX idx_vouchers_status ON public.vouchers(status);

CREATE POLICY "Staff view vouchers" ON public.vouchers FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Accounts insert vouchers" ON public.vouchers FOR INSERT WITH CHECK (is_accounts(auth.uid()));
CREATE POLICY "Accounts update vouchers" ON public.vouchers FOR UPDATE USING (is_accounts(auth.uid()));
CREATE POLICY "Admins delete vouchers" ON public.vouchers FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER vouchers_updated BEFORE UPDATE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate voucher_no
CREATE OR REPLACE FUNCTION public.generate_voucher_no()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  prefix text;
  yr text := to_char(COALESCE(NEW.voucher_date, CURRENT_DATE), 'YYYY');
  nextn int;
BEGIN
  IF NEW.voucher_no IS NOT NULL AND NEW.voucher_no <> '' THEN RETURN NEW; END IF;
  prefix := CASE NEW.voucher_type
    WHEN 'payment' THEN 'PV'
    WHEN 'receipt' THEN 'RV'
    WHEN 'journal' THEN 'JV'
    WHEN 'contra' THEN 'CV'
  END;
  SELECT COALESCE(MAX((regexp_match(voucher_no, '[0-9]+$'))[1]::int), 0) + 1
    INTO nextn
    FROM public.vouchers
    WHERE voucher_no LIKE prefix || '-' || yr || '-%';
  NEW.voucher_no := prefix || '-' || yr || '-' || lpad(nextn::text, 4, '0');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_voucher_no BEFORE INSERT ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.generate_voucher_no();

-- Block edits on posted vouchers
CREATE OR REPLACE FUNCTION public.prevent_posted_voucher_edit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'posted' AND NEW.status = 'posted' THEN
    -- only allow status change to cancelled
    IF NEW.voucher_no IS DISTINCT FROM OLD.voucher_no
       OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
       OR NEW.voucher_date IS DISTINCT FROM OLD.voucher_date
       OR NEW.currency IS DISTINCT FROM OLD.currency THEN
      RAISE EXCEPTION 'Posted voucher cannot be edited';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' AND OLD.status = 'posted' THEN
    RAISE EXCEPTION 'Posted vouchers cannot be deleted';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_voucher_lock BEFORE UPDATE OR DELETE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.prevent_posted_voucher_edit();

-- ---------- voucher_lines ----------
CREATE TABLE public.voucher_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  line_no int NOT NULL DEFAULT 1,
  account_id uuid NOT NULL REFERENCES public.chart_of_accounts(id),
  debit numeric NOT NULL DEFAULT 0,
  credit numeric NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.voucher_lines ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_vlines_voucher ON public.voucher_lines(voucher_id);
CREATE INDEX idx_vlines_account ON public.voucher_lines(account_id);

CREATE POLICY "Staff view voucher lines" ON public.voucher_lines FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Accounts manage voucher lines" ON public.voucher_lines FOR ALL USING (is_accounts(auth.uid())) WITH CHECK (is_accounts(auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_posted_line_edit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE st text;
BEGIN
  SELECT status INTO st FROM public.vouchers WHERE id = COALESCE(NEW.voucher_id, OLD.voucher_id);
  IF st = 'posted' THEN
    RAISE EXCEPTION 'Cannot modify lines of a posted voucher';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_line_lock BEFORE INSERT OR UPDATE OR DELETE ON public.voucher_lines FOR EACH ROW EXECUTE FUNCTION public.prevent_posted_line_edit();

-- ---------- ledger_entries ----------
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  voucher_line_id uuid REFERENCES public.voucher_lines(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.chart_of_accounts(id),
  entry_date date NOT NULL,
  debit numeric NOT NULL DEFAULT 0,
  credit numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  ghs_equivalent numeric NOT NULL DEFAULT 0,
  consignment_id uuid,
  customer_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ledger_account ON public.ledger_entries(account_id);
CREATE INDEX idx_ledger_date ON public.ledger_entries(entry_date);
CREATE INDEX idx_ledger_consignment ON public.ledger_entries(consignment_id);
CREATE INDEX idx_ledger_customer ON public.ledger_entries(customer_id);

CREATE POLICY "Staff view ledger" ON public.ledger_entries FOR SELECT USING (NOT is_client(auth.uid()));
-- Inserts only via post_voucher (security definer)

-- ---------- finance_audit_logs ----------
CREATE TABLE public.finance_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid REFERENCES public.vouchers(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accounts view audit" ON public.finance_audit_logs FOR SELECT USING (is_accounts(auth.uid()));
CREATE POLICY "Authenticated insert audit" ON public.finance_audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---------- post_voucher RPC ----------
CREATE OR REPLACE FUNCTION public.post_voucher(_voucher_id uuid)
RETURNS public.vouchers
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.vouchers;
  total_dr numeric;
  total_cr numeric;
  inv_paid numeric;
  inv_total numeric;
BEGIN
  IF NOT is_accounts(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v FROM public.vouchers WHERE id = _voucher_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Voucher not found'; END IF;
  IF v.status = 'posted' THEN RAISE EXCEPTION 'Already posted'; END IF;
  IF v.status = 'cancelled' THEN RAISE EXCEPTION 'Cancelled voucher cannot be posted'; END IF;

  SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0)
    INTO total_dr, total_cr FROM public.voucher_lines WHERE voucher_id = _voucher_id;

  IF total_dr = 0 OR total_cr = 0 THEN
    RAISE EXCEPTION 'Voucher has no entries';
  END IF;
  IF round(total_dr,2) <> round(total_cr,2) THEN
    RAISE EXCEPTION 'Voucher not balanced (Dr % vs Cr %)', total_dr, total_cr;
  END IF;

  -- Insert ledger entries
  INSERT INTO public.ledger_entries (voucher_id, voucher_line_id, account_id, entry_date, debit, credit, currency, ghs_equivalent, consignment_id, customer_id, description)
  SELECT vl.voucher_id, vl.id, vl.account_id, v.voucher_date, vl.debit, vl.credit, v.currency,
         (GREATEST(vl.debit, vl.credit) * v.exchange_rate),
         v.consignment_id, v.customer_id, vl.description
  FROM public.voucher_lines vl WHERE vl.voucher_id = _voucher_id;

  UPDATE public.vouchers
    SET status='posted', posted_at=now(), posted_by=auth.uid(),
        total_amount=total_dr,
        ghs_equivalent=total_dr * exchange_rate
    WHERE id = _voucher_id
    RETURNING * INTO v;

  -- If receipt voucher tied to invoice → update invoice
  IF v.voucher_type = 'receipt' AND v.invoice_id IS NOT NULL THEN
    SELECT total_amount INTO inv_total FROM public.finance_invoices WHERE id = v.invoice_id;
    UPDATE public.finance_invoices
      SET paid_amount = COALESCE(paid_amount,0) + v.ghs_equivalent,
          paid_date = v.voucher_date,
          payment_method = v.payment_method,
          status = CASE
            WHEN COALESCE(paid_amount,0) + v.ghs_equivalent >= inv_total THEN 'paid'
            ELSE 'partially_paid'
          END
      WHERE id = v.invoice_id;
  END IF;

  INSERT INTO public.finance_audit_logs (voucher_id, action, details, user_id)
    VALUES (_voucher_id, 'post', jsonb_build_object('total', total_dr), auth.uid());

  RETURN v;
END;
$$;

-- Cancel voucher (reverses ledger)
CREATE OR REPLACE FUNCTION public.cancel_voucher(_voucher_id uuid, _reason text)
RETURNS public.vouchers
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.vouchers;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'Only admins can cancel posted vouchers'; END IF;
  SELECT * INTO v FROM public.vouchers WHERE id=_voucher_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;
  DELETE FROM public.ledger_entries WHERE voucher_id=_voucher_id;
  UPDATE public.vouchers SET status='cancelled' WHERE id=_voucher_id RETURNING * INTO v;
  INSERT INTO public.finance_audit_logs(voucher_id, action, details, user_id)
    VALUES (_voucher_id, 'cancel', jsonb_build_object('reason', _reason), auth.uid());
  RETURN v;
END;
$$;

-- ---------- Seed Chart of Accounts ----------
INSERT INTO public.chart_of_accounts (code, name, type, currency) VALUES
  ('1000','Cash on Hand','asset','GHS'),
  ('1010','Bank - GHS','asset','GHS'),
  ('1020','Bank - USD','asset','USD'),
  ('1030','Bank - EUR','asset','EUR'),
  ('1100','Accounts Receivable','asset','GHS'),
  ('2000','Accounts Payable','liability','GHS'),
  ('2100','Duties & Taxes Payable','liability','GHS'),
  ('3000','Retained Earnings','equity','GHS'),
  ('4000','Sales - Clearance','income','GHS'),
  ('4010','Sales - Freight','income','GHS'),
  ('4020','Sales - Trucking','income','GHS'),
  ('4030','Sales - Warehousing','income','GHS'),
  ('4040','Sales - Documentation','income','GHS'),
  ('4090','Other Income','income','GHS'),
  ('5000','Port Charges','expense','GHS'),
  ('5010','Terminal Handling Charges','expense','GHS'),
  ('5020','Shipping Line Charges','expense','GHS'),
  ('5030','Customs Duty','expense','GHS'),
  ('5040','Fuel','expense','GHS'),
  ('5050','Trucking Costs','expense','GHS'),
  ('5060','Documentation Fees','expense','GHS'),
  ('5070','Salaries & Wages','expense','GHS'),
  ('5080','Office Rent','expense','GHS'),
  ('5090','Utilities','expense','GHS'),
  ('5100','FX Gain/Loss','expense','GHS'),
  ('5900','Other Expenses','expense','GHS');
