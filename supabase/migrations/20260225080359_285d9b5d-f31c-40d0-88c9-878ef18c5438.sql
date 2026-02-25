
-- Create table for shipping line documents
CREATE TABLE public.shipping_line_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipping_line TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'invoice',
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  bl_number TEXT,
  container_number TEXT,
  notes TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_line_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view shipping line documents"
ON public.shipping_line_documents FOR SELECT
USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert shipping line documents"
ON public.shipping_line_documents FOR INSERT
WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update shipping line documents"
ON public.shipping_line_documents FOR UPDATE
USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete shipping line documents"
ON public.shipping_line_documents FOR DELETE
USING (is_admin(auth.uid()));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('shipping-line-docs', 'shipping-line-docs', false);

-- Storage policies
CREATE POLICY "Staff can view shipping line docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'shipping-line-docs' AND (NOT public.is_client(auth.uid())));

CREATE POLICY "Staff can upload shipping line docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shipping-line-docs' AND (NOT public.is_client(auth.uid())));

CREATE POLICY "Admins can delete shipping line docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'shipping-line-docs' AND public.is_admin(auth.uid()));
