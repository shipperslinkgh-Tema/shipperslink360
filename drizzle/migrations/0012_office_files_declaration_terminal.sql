ALTER TABLE public.completed_consignments ADD COLUMN IF NOT EXISTS declaration_number text, ADD COLUMN IF NOT EXISTS terminal text;
CREATE INDEX IF NOT EXISTS idx_completed_consignments_declaration ON public.completed_consignments(declaration_number);
ALTER TABLE public.consignment_documents DROP CONSTRAINT IF EXISTS consignment_documents_category_check;
ALTER TABLE public.consignment_documents ADD CONSTRAINT consignment_documents_category_check CHECK (category = ANY (ARRAY['customs','shipping_line','company_financial','warehouse','shipping','terminal']));