
-- Table
CREATE TABLE public.accounts_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('shipping_line','customs','other')),
  document_type text NOT NULL DEFAULT 'invoice', -- invoice | receipt | duty_payment | other
  party_name text,            -- e.g. Maersk, GRA Customs
  reference_no text,          -- BL / declaration / receipt no
  consignment_ref text,
  customer text,
  voucher_id uuid REFERENCES public.vouchers(id) ON DELETE SET NULL,
  amount numeric(14,2),
  currency text DEFAULT 'GHS',
  document_date date DEFAULT CURRENT_DATE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size text,
  notes text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_acc_docs_source ON public.accounts_documents(source);
CREATE INDEX idx_acc_docs_consignment ON public.accounts_documents(consignment_ref);

ALTER TABLE public.accounts_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accounts manage docs" ON public.accounts_documents
  FOR ALL USING (is_accounts(auth.uid())) WITH CHECK (is_accounts(auth.uid()));
CREATE POLICY "Staff view docs" ON public.accounts_documents
  FOR SELECT USING (NOT is_client(auth.uid()));

CREATE TRIGGER trg_acc_docs_updated
  BEFORE UPDATE ON public.accounts_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('accounts-documents','accounts-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Accounts read acc-docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'accounts-documents' AND NOT is_client(auth.uid()));
CREATE POLICY "Accounts upload acc-docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'accounts-documents' AND is_accounts(auth.uid()));
CREATE POLICY "Accounts update acc-docs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'accounts-documents' AND is_accounts(auth.uid()));
CREATE POLICY "Accounts delete acc-docs" ON storage.objects
  FOR DELETE USING (bucket_id = 'accounts-documents' AND is_accounts(auth.uid()));
