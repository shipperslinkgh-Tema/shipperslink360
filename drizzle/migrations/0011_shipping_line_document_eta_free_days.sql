ALTER TABLE public.shipping_line_documents
  ADD COLUMN IF NOT EXISTS eta DATE,
  ADD COLUMN IF NOT EXISTS free_days INTEGER;

COMMENT ON COLUMN public.shipping_line_documents.eta IS 'Vessel estimated time of arrival recorded when this document was uploaded against the BL';
COMMENT ON COLUMN public.shipping_line_documents.free_days IS 'Free days granted by the shipping line for this BL, recorded at upload';