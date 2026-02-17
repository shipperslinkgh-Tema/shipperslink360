
-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);

-- Staff (non-client authenticated users) can upload files
CREATE POLICY "Staff can upload client documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
  AND NOT public.is_client(auth.uid())
  AND auth.uid() IS NOT NULL
);

-- Staff can view all files in the bucket
CREATE POLICY "Staff can view client documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-documents'
  AND NOT public.is_client(auth.uid())
  AND auth.uid() IS NOT NULL
);

-- Staff can delete files
CREATE POLICY "Staff can delete client documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-documents'
  AND NOT public.is_client(auth.uid())
  AND auth.uid() IS NOT NULL
);

-- Clients can download files in their own folder (folder name = customer_id)
CREATE POLICY "Clients can download own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-documents'
  AND public.is_client(auth.uid())
  AND (storage.foldername(name))[1] = public.get_client_customer_id(auth.uid())
);
