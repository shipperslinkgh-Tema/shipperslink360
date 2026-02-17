
-- Client profiles linked to customer records
CREATE TABLE public.client_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  customer_id TEXT NOT NULL, -- links to customer record
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a client
CREATE OR REPLACE FUNCTION public.is_client(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE user_id = _user_id AND is_active = true
  )
$$;

-- Function to get client's customer_id
CREATE OR REPLACE FUNCTION public.get_client_customer_id(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT customer_id FROM public.client_profiles
  WHERE user_id = _user_id AND is_active = true
$$;

-- Client profiles RLS
CREATE POLICY "Clients can view own profile"
  ON public.client_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage client profiles"
  ON public.client_profiles FOR ALL
  USING (is_admin(auth.uid()));

-- Client shipments table
CREATE TABLE public.client_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  bl_number TEXT NOT NULL,
  container_number TEXT,
  vessel_name TEXT,
  voyage_number TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_description TEXT,
  weight_kg NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_transit','at_port','customs_clearance','delivered','on_hold')),
  eta TIMESTAMP WITH TIME ZONE,
  ata TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own shipments"
  ON public.client_shipments FOR SELECT
  USING (customer_id = get_client_customer_id(auth.uid()));

CREATE POLICY "Staff can manage shipments"
  ON public.client_shipments FOR ALL
  USING (is_admin(auth.uid()) OR NOT is_client(auth.uid()));

-- Client documents table
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  shipment_id UUID REFERENCES public.client_shipments(id),
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('sop','bill_of_lading','customs_declaration','invoice','packing_list','certificate_of_origin','delivery_order','other')),
  file_url TEXT,
  file_size TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','pending','archived')),
  uploaded_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own documents"
  ON public.client_documents FOR SELECT
  USING (customer_id = get_client_customer_id(auth.uid()));

CREATE POLICY "Staff can manage documents"
  ON public.client_documents FOR ALL
  USING (is_admin(auth.uid()) OR NOT is_client(auth.uid()));

-- Client invoices table
CREATE TABLE public.client_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  shipment_id UUID REFERENCES public.client_shipments(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial','cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount NUMERIC DEFAULT 0,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own invoices"
  ON public.client_invoices FOR SELECT
  USING (customer_id = get_client_customer_id(auth.uid()));

CREATE POLICY "Staff can manage invoices"
  ON public.client_invoices FOR ALL
  USING (is_admin(auth.uid()) OR NOT is_client(auth.uid()));

-- Client messages table
CREATE TABLE public.client_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client','staff')),
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own messages"
  ON public.client_messages FOR SELECT
  USING (customer_id = get_client_customer_id(auth.uid()));

CREATE POLICY "Clients can send messages"
  ON public.client_messages FOR INSERT
  WITH CHECK (customer_id = get_client_customer_id(auth.uid()) AND sender_type = 'client');

CREATE POLICY "Staff can manage all messages"
  ON public.client_messages FOR ALL
  USING (is_admin(auth.uid()) OR NOT is_client(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_shipments_updated_at BEFORE UPDATE ON public.client_shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON public.client_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_invoices_updated_at BEFORE UPDATE ON public.client_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_messages;
