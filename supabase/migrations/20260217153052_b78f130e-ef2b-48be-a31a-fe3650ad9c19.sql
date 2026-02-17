
-- Bank connections table
CREATE TABLE public.bank_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL, -- 'access_bank', 'ecobank', 'gcb', 'adb'
  bank_display_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'current', -- 'current', 'savings'
  currency TEXT NOT NULL DEFAULT 'GHS',
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  balance NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending', -- 'connected', 'pending', 'error', 'disconnected'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view bank connections"
ON public.bank_connections FOR SELECT
USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can manage bank connections"
ON public.bank_connections FOR ALL
USING (is_admin(auth.uid()));

-- Bank transactions table
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  transaction_ref TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'credit', 'debit'
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  balance_after NUMERIC,
  description TEXT,
  counterparty_name TEXT,
  counterparty_account TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  value_date TIMESTAMP WITH TIME ZONE,
  -- Auto-matching fields
  matched_invoice_id TEXT,
  matched_receivable_id TEXT,
  match_status TEXT NOT NULL DEFAULT 'unmatched', -- 'unmatched', 'auto_matched', 'manually_matched', 'disputed'
  match_confidence NUMERIC,
  -- Reconciliation
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID,
  notes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view bank transactions"
ON public.bank_transactions FOR SELECT
USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can manage bank transactions"
ON public.bank_transactions FOR ALL
USING (is_admin(auth.uid()));

-- Transaction alerts table
CREATE TABLE public.bank_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.bank_transactions(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL, -- 'credit_received', 'debit_processed', 'failed_transaction', 'low_balance', 'large_transaction', 'reconciliation_mismatch'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  amount NUMERIC,
  currency TEXT DEFAULT 'GHS',
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  read_by UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view bank alerts"
ON public.bank_alerts FOR SELECT
USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update bank alerts"
ON public.bank_alerts FOR UPDATE
USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can manage bank alerts"
ON public.bank_alerts FOR ALL
USING (is_admin(auth.uid()));

-- Reconciliation records table
CREATE TABLE public.bank_reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  bank_opening_balance NUMERIC NOT NULL DEFAULT 0,
  bank_closing_balance NUMERIC NOT NULL DEFAULT 0,
  book_opening_balance NUMERIC NOT NULL DEFAULT 0,
  book_closing_balance NUMERIC NOT NULL DEFAULT 0,
  total_credits NUMERIC NOT NULL DEFAULT 0,
  total_debits NUMERIC NOT NULL DEFAULT 0,
  matched_count INTEGER NOT NULL DEFAULT 0,
  unmatched_count INTEGER NOT NULL DEFAULT 0,
  discrepancy_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'approved'
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view reconciliations"
ON public.bank_reconciliations FOR SELECT
USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can manage reconciliations"
ON public.bank_reconciliations FOR ALL
USING (is_admin(auth.uid()));

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_alerts;

-- Triggers for updated_at
CREATE TRIGGER update_bank_connections_updated_at
BEFORE UPDATE ON public.bank_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_reconciliations_updated_at
BEFORE UPDATE ON public.bank_reconciliations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
