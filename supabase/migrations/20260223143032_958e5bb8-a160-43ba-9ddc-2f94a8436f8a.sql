
-- Completed Consignments table
CREATE TABLE public.completed_consignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_ref text NOT NULL UNIQUE,
  bl_number text,
  awb_number text,
  container_numbers text[] DEFAULT '{}',
  client_name text NOT NULL,
  client_id uuid REFERENCES public.customers(id),
  shipment_type text NOT NULL CHECK (shipment_type IN ('sea', 'air')),
  clearance_date date,
  delivery_date date,
  officer_in_charge text NOT NULL,
  officer_user_id uuid,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed')),
  is_locked boolean NOT NULL DEFAULT true,
  total_revenue numeric DEFAULT 0,
  total_expenses numeric DEFAULT 0,
  financial_summary jsonb,
  notes text,
  completed_by uuid,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.completed_consignments ENABLE ROW LEVEL SECURITY;

-- Staff can view
CREATE POLICY "Staff can view completed consignments"
  ON public.completed_consignments FOR SELECT
  USING (NOT is_client(auth.uid()));

-- Staff can insert (mark as completed)
CREATE POLICY "Staff can insert completed consignments"
  ON public.completed_consignments FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

-- Only admins can update locked consignments
CREATE POLICY "Admins can update completed consignments"
  ON public.completed_consignments FOR UPDATE
  USING (is_admin(auth.uid()));

-- Only super_admin can delete
CREATE POLICY "Super admins can delete completed consignments"
  ON public.completed_consignments FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_completed_consignments_updated_at
  BEFORE UPDATE ON public.completed_consignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_completed_consignments_client ON public.completed_consignments(client_id);
CREATE INDEX idx_completed_consignments_bl ON public.completed_consignments(bl_number);
CREATE INDEX idx_completed_consignments_awb ON public.completed_consignments(awb_number);
CREATE INDEX idx_completed_consignments_ref ON public.completed_consignments(consignment_ref);

-- Consignment Documents table
CREATE TABLE public.consignment_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id uuid NOT NULL REFERENCES public.completed_consignments(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('customs', 'shipping_line', 'company_financial', 'warehouse', 'shipping')),
  document_type text NOT NULL,
  document_name text NOT NULL,
  file_url text,
  file_size bigint,
  mime_type text,
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  previous_version_id uuid REFERENCES public.consignment_documents(id),
  uploaded_by uuid NOT NULL,
  uploaded_by_name text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consignment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view consignment documents"
  ON public.consignment_documents FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert consignment documents"
  ON public.consignment_documents FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

-- Only admins can update docs on locked consignments
CREATE POLICY "Admins can update consignment documents"
  ON public.consignment_documents FOR UPDATE
  USING (is_admin(auth.uid()));

-- Only super_admin can delete
CREATE POLICY "Super admins can delete consignment documents"
  ON public.consignment_documents FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_consignment_documents_updated_at
  BEFORE UPDATE ON public.consignment_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_consignment_docs_consignment ON public.consignment_documents(consignment_id);
CREATE INDEX idx_consignment_docs_category ON public.consignment_documents(category);
CREATE INDEX idx_consignment_docs_type ON public.consignment_documents(document_type);

-- Consignment Audit Logs
CREATE TABLE public.consignment_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id uuid NOT NULL REFERENCES public.completed_consignments(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.consignment_documents(id),
  action text NOT NULL,
  action_details jsonb,
  performed_by uuid NOT NULL,
  performed_by_name text NOT NULL,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consignment_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view consignment audit logs"
  ON public.consignment_audit_logs FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert consignment audit logs"
  ON public.consignment_audit_logs FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE INDEX idx_consignment_audit_consignment ON public.consignment_audit_logs(consignment_id);
CREATE INDEX idx_consignment_audit_document ON public.consignment_audit_logs(document_id);

-- Storage bucket for consignment files
INSERT INTO storage.buckets (id, name, public) VALUES ('consignment-files', 'consignment-files', false);

-- Storage policies
CREATE POLICY "Staff can view consignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consignment-files' AND (NOT public.is_client(auth.uid())));

CREATE POLICY "Staff can upload consignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'consignment-files' AND (NOT public.is_client(auth.uid())));

CREATE POLICY "Admins can update consignment files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'consignment-files' AND public.is_admin(auth.uid()));

CREATE POLICY "Super admins can delete consignment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'consignment-files' AND public.has_role(auth.uid(), 'super_admin'));
