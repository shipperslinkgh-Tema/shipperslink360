
-- Allow clients to upload to their own folder in client-documents bucket
CREATE POLICY "Clients can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
  AND is_client(auth.uid())
  AND (storage.foldername(name))[1] = get_client_customer_id(auth.uid())
);

-- Allow clients to insert metadata rows for their own documents
CREATE POLICY "Clients can upload own documents metadata"
ON public.client_documents FOR INSERT
WITH CHECK (customer_id = get_client_customer_id(auth.uid()));
