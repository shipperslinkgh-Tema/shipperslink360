
-- ═══════════════════════════════════════════════════════════════
-- CONSIGNMENT WORKFLOW ENGINE - Core Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Master Consignment Workflows table
CREATE TABLE public.consignment_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consignment_ref text NOT NULL UNIQUE,
  client_name text NOT NULL,
  client_contact text,
  client_id uuid REFERENCES public.customers(id),
  supplier_name text,
  origin_country text,
  port_of_loading text,
  port_of_discharge text DEFAULT 'Tema',
  container_number text,
  bl_number text,
  awb_number text,
  cargo_description text,
  weight_kg numeric(12,2),
  volume_cbm numeric(10,2),
  shipment_type text NOT NULL DEFAULT 'sea',
  eta date,
  vessel_name text,
  voyage_number text,
  incoterms text,
  
  -- Workflow stage tracking
  current_stage text NOT NULL DEFAULT 'documents_received',
  -- stages: documents_received, documentation_processing, customs_declaration, 
  --         duty_payment, port_processing, cargo_release, truck_assignment, 
  --         delivery_in_transit, delivery_completed
  
  stage_started_at timestamptz DEFAULT now(),
  
  -- Stage completion timestamps
  documents_received_at timestamptz DEFAULT now(),
  documents_received_by uuid,
  documentation_started_at timestamptz,
  documentation_completed_at timestamptz,
  documentation_completed_by uuid,
  customs_declared_at timestamptz,
  customs_declared_by uuid,
  duty_paid_at timestamptz,
  duty_paid_by uuid,
  port_processing_at timestamptz,
  port_processing_by uuid,
  cargo_released_at timestamptz,
  cargo_released_by uuid,
  truck_assigned_at timestamptz,
  truck_assigned_by uuid,
  delivery_started_at timestamptz,
  delivery_completed_at timestamptz,
  delivery_completed_by uuid,
  
  -- Linked records
  consolidation_id uuid,
  trucking_trip_id uuid,
  
  -- Customs details
  icums_declaration_number text,
  hs_code text,
  fob_value numeric(12,2),
  freight_value numeric(12,2),
  insurance_value numeric(12,2),
  cif_value numeric(12,2),
  duty_amount numeric(12,2),
  
  -- Port operations
  delivery_order_number text,
  free_days integer DEFAULT 14,
  free_days_start date,
  shipping_line text,
  terminal text DEFAULT 'Tema Port',
  terminal_charges numeric(12,2),
  shipping_line_charges numeric(12,2),
  
  -- General
  assigned_officer text,
  assigned_officer_id uuid,
  notes text,
  is_urgent boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consignment_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view consignment workflows"
  ON public.consignment_workflows FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert consignment workflows"
  ON public.consignment_workflows FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update consignment workflows"
  ON public.consignment_workflows FOR UPDATE
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete consignment workflows"
  ON public.consignment_workflows FOR DELETE
  USING (is_admin(auth.uid()));

-- Clients can view their own consignments
CREATE POLICY "Clients can view own consignment workflows"
  ON public.consignment_workflows FOR SELECT
  USING (client_id::text = get_client_customer_id(auth.uid()));

-- Indexes
CREATE INDEX idx_workflows_stage ON public.consignment_workflows(current_stage);
CREATE INDEX idx_workflows_client ON public.consignment_workflows(client_id);
CREATE INDEX idx_workflows_ref ON public.consignment_workflows(consignment_ref);

-- 2. Workflow Documents table
CREATE TABLE public.workflow_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.consignment_workflows(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  -- types: bill_of_lading, packing_list, commercial_invoice, certificate_of_origin,
  --        idf, bill_of_entry, duty_receipt, assessment_notice, delivery_order,
  --        shipping_line_invoice, terminal_receipt, interchange_document,
  --        customs_payment_receipt, company_invoice, other
  document_name text NOT NULL,
  file_url text,
  file_size bigint,
  mime_type text,
  stage text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_by_name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view workflow documents"
  ON public.workflow_documents FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert workflow documents"
  ON public.workflow_documents FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete workflow documents"
  ON public.workflow_documents FOR DELETE
  USING (is_admin(auth.uid()));

CREATE INDEX idx_workflow_docs_workflow ON public.workflow_documents(workflow_id);

-- 3. Workflow Timeline / Activity Log
CREATE TABLE public.workflow_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.consignment_workflows(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  -- types: stage_change, document_upload, note_added, assignment, status_update, notification_sent
  stage text,
  title text NOT NULL,
  description text,
  performed_by uuid,
  performed_by_name text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view workflow timeline"
  ON public.workflow_timeline FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert workflow timeline"
  ON public.workflow_timeline FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE INDEX idx_timeline_workflow ON public.workflow_timeline(workflow_id);
CREATE INDEX idx_timeline_created ON public.workflow_timeline(created_at DESC);

-- 4. Workflow Notifications table (department-specific)
CREATE TABLE public.workflow_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.consignment_workflows(id) ON DELETE CASCADE,
  consignment_ref text NOT NULL,
  target_department text NOT NULL,
  -- departments: management, documentation, operations, accounts, warehouse, trucking, customer_service
  target_user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  action_required text,
  action_url text,
  is_read boolean NOT NULL DEFAULT false,
  is_actioned boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  actioned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view workflow notifications"
  ON public.workflow_notifications FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert workflow notifications"
  ON public.workflow_notifications FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update workflow notifications"
  ON public.workflow_notifications FOR UPDATE
  USING (NOT is_client(auth.uid()));

CREATE INDEX idx_wf_notif_dept ON public.workflow_notifications(target_department, is_read);
CREATE INDEX idx_wf_notif_workflow ON public.workflow_notifications(workflow_id);

-- Enable realtime for workflow notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consignment_workflows;

-- Create storage bucket for workflow documents
INSERT INTO storage.buckets (id, name, public) VALUES ('workflow-documents', 'workflow-documents', false);

-- Storage RLS for workflow documents
CREATE POLICY "Staff can upload workflow documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'workflow-documents' AND NOT is_client(auth.uid()));

CREATE POLICY "Staff can view workflow documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workflow-documents' AND NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete workflow documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'workflow-documents' AND is_admin(auth.uid()));
