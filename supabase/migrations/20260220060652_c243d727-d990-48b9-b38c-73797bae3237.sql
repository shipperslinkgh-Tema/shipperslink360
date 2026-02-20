
-- =====================================================
-- MODULE 1: CUSTOMERS (CRM)
-- =====================================================

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  trade_name text,
  registration_number text,
  tin_number text UNIQUE,
  industry text,
  company_type text NOT NULL DEFAULT 'importer', -- importer, exporter, both, freight_forwarder
  address text,
  city text,
  country text DEFAULT 'Ghana',
  email text NOT NULL,
  phone text,
  website text,
  status text NOT NULL DEFAULT 'active', -- active, inactive, suspended
  credit_limit numeric(15,2) DEFAULT 0,
  outstanding_balance numeric(15,2) DEFAULT 0,
  total_shipments integer DEFAULT 0,
  credit_status text DEFAULT 'good', -- good, watch, hold, suspend
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage customer contacts" ON public.customer_contacts FOR ALL USING (NOT is_client(auth.uid()));

CREATE TABLE public.customer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  document_type text NOT NULL DEFAULT 'other', -- registration, license, contract, invoice, other
  upload_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  status text DEFAULT 'valid', -- valid, expired, pending
  file_size text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage customer documents" ON public.customer_documents FOR ALL USING (NOT is_client(auth.uid()));

-- =====================================================
-- MODULE 2: CONSOLIDATION
-- =====================================================

CREATE TABLE public.consolidations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidation_ref text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'LCL', -- LCL, AIR
  master_bl_number text,
  master_awb_number text,
  origin text NOT NULL,
  destination text NOT NULL,
  vessel text,
  voyage text,
  flight text,
  carrier text NOT NULL,
  etd date,
  eta date,
  status text NOT NULL DEFAULT 'planning', -- planning, receiving, stuffing, customs, in-transit, arrived, delivered, closed
  container_number text,
  container_type text, -- 20GP, 40GP, 40HC, 45HC
  total_cbm numeric(10,2) DEFAULT 0,
  total_weight numeric(10,2) DEFAULT 0,
  total_packages integer DEFAULT 0,
  shippers_count integer DEFAULT 0,
  port text DEFAULT 'Tema', -- Tema, Takoradi, Kotoka
  warehouse text,
  stuffing_date date,
  cutoff_date date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consolidations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view consolidations" ON public.consolidations FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert consolidations" ON public.consolidations FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update consolidations" ON public.consolidations FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete consolidations" ON public.consolidations FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.consolidation_shippers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidation_id uuid NOT NULL REFERENCES public.consolidations(id) ON DELETE CASCADE,
  house_bl_number text,
  house_awb_number text,
  shipper_name text NOT NULL,
  shipper_address text,
  consignee_name text NOT NULL,
  consignee_address text,
  notify_party text,
  description text,
  hs_code text,
  hs_description text,
  packages integer DEFAULT 0,
  package_type text DEFAULT 'cartons', -- cartons, pallets, drums, bags, crates, pieces
  gross_weight numeric(10,2) DEFAULT 0,
  net_weight numeric(10,2) DEFAULT 0,
  cbm numeric(10,2) DEFAULT 0,
  cargo_status text DEFAULT 'pending', -- pending, received, tallied, stored, loaded, dispatched
  customs_status text DEFAULT 'pending', -- pending, submitted, assessment, payment, examination, released, held
  icums_ref text,
  duty_amount numeric(15,2) DEFAULT 0,
  tax_amount numeric(15,2) DEFAULT 0,
  freight_charge numeric(15,2) DEFAULT 0,
  handling_charge numeric(15,2) DEFAULT 0,
  documentation_fee numeric(15,2) DEFAULT 0,
  storage_charge numeric(15,2) DEFAULT 0,
  total_charge numeric(15,2) DEFAULT 0,
  invoiced boolean DEFAULT false,
  invoice_number text,
  paid boolean DEFAULT false,
  remarks text,
  received_date date,
  received_by text,
  tally_confirmed boolean DEFAULT false,
  release_status text DEFAULT 'pending', -- pending, partial, released
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consolidation_shippers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage shippers" ON public.consolidation_shippers FOR ALL USING (NOT is_client(auth.uid()));

CREATE TABLE public.cargo_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE,
  shipper_id uuid NOT NULL REFERENCES public.consolidation_shippers(id) ON DELETE CASCADE,
  consolidation_id uuid NOT NULL REFERENCES public.consolidations(id) ON DELETE CASCADE,
  received_date date NOT NULL,
  received_by text NOT NULL,
  warehouse_location text,
  packages_received integer DEFAULT 0,
  packages_declared integer DEFAULT 0,
  weight_received numeric(10,2) DEFAULT 0,
  weight_declared numeric(10,2) DEFAULT 0,
  condition text DEFAULT 'good', -- good, damaged, partial
  damage_notes text,
  tally_sheet_ref text,
  verified boolean DEFAULT false,
  verified_by text,
  verified_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cargo_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage cargo receipts" ON public.cargo_receipts FOR ALL USING (NOT is_client(auth.uid()));

CREATE TABLE public.consolidation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidation_id uuid NOT NULL REFERENCES public.consolidations(id) ON DELETE CASCADE,
  shipper_id uuid REFERENCES public.consolidation_shippers(id) ON DELETE SET NULL,
  document_type text NOT NULL, -- MBL, HBL, MAWB, HAWB, invoice, packing_list, customs_declaration, delivery_order, certificate_origin
  document_number text NOT NULL,
  status text DEFAULT 'draft', -- draft, issued, submitted, approved, released
  issued_date date,
  issued_by text,
  submitted_date date,
  approved_date date,
  file_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consolidation_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage consolidation docs" ON public.consolidation_documents FOR ALL USING (NOT is_client(auth.uid()));

CREATE TABLE public.demurrage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidation_id uuid NOT NULL REFERENCES public.consolidations(id) ON DELETE CASCADE,
  container_number text NOT NULL,
  free_time_start date NOT NULL,
  free_time_days integer DEFAULT 14,
  free_time_end date NOT NULL,
  current_days integer DEFAULT 0,
  demurrage_days integer DEFAULT 0,
  daily_rate numeric(10,2) DEFAULT 0,
  total_demurrage numeric(15,2) DEFAULT 0,
  storage_days integer DEFAULT 0,
  storage_rate numeric(10,2) DEFAULT 0,
  total_storage numeric(15,2) DEFAULT 0,
  status text DEFAULT 'within_free', -- within_free, demurrage, critical, paid
  last_updated date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demurrage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage demurrage" ON public.demurrage_records FOR ALL USING (NOT is_client(auth.uid()));

-- =====================================================
-- MODULE 3: TRUCKING
-- =====================================================

CREATE TABLE public.trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text NOT NULL UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  type text NOT NULL DEFAULT 'container', -- flatbed, container, tanker, lowbed
  capacity text,
  status text NOT NULL DEFAULT 'available', -- available, on-trip, maintenance
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view trucks" ON public.trucks FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert trucks" ON public.trucks FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update trucks" ON public.trucks FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete trucks" ON public.trucks FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  license_number text UNIQUE,
  license_expiry date,
  status text NOT NULL DEFAULT 'available', -- available, on-trip, off-duty
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view drivers" ON public.drivers FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert drivers" ON public.drivers FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update drivers" ON public.drivers FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete drivers" ON public.drivers FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.trucking_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL REFERENCES public.trucks(id),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  container_number text,
  bl_number text,
  customer text,
  customer_id uuid REFERENCES public.customers(id),
  origin text NOT NULL,
  destination text NOT NULL,
  pickup_date date,
  delivery_date date,
  container_return_date date,
  container_return_location text,
  container_returned boolean DEFAULT false,
  trip_cost numeric(15,2) DEFAULT 0,
  driver_payment numeric(15,2) DEFAULT 0,
  fuel_cost numeric(15,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled, in-transit, delivered, completed
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trucking_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view trips" ON public.trucking_trips FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert trips" ON public.trucking_trips FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update trips" ON public.trucking_trips FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete trips" ON public.trucking_trips FOR DELETE USING (is_admin(auth.uid()));

-- =====================================================
-- MODULE 4: ADDITIONAL FINANCE TABLES
-- =====================================================

CREATE TABLE public.finance_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_ref text NOT NULL UNIQUE,
  invoice_id text,
  invoice_number text,
  payable_id text,
  payable_ref text,
  customer text,
  customer_id text,
  vendor text,
  type text NOT NULL DEFAULT 'incoming', -- incoming, outgoing
  category text DEFAULT 'other',
  amount numeric(15,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'GHS',
  exchange_rate numeric(10,4) DEFAULT 1,
  ghs_equivalent numeric(15,2) DEFAULT 0,
  method text DEFAULT 'bank_transfer', -- bank_transfer, cheque, cash, mobile_money, letter_of_credit
  bank_account text,
  transaction_ref text,
  status text DEFAULT 'pending', -- pending, processing, completed, failed, refunded, cancelled
  payment_date date DEFAULT CURRENT_DATE,
  value_date date,
  description text,
  approval_status text DEFAULT 'pending',
  approved_by text,
  approval_date date,
  created_by text DEFAULT 'System',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view payments" ON public.finance_payments FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert payments" ON public.finance_payments FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update payments" ON public.finance_payments FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete payments" ON public.finance_payments FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.finance_payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payable_ref text NOT NULL UNIQUE,
  vendor text NOT NULL,
  vendor_id text,
  vendor_category text DEFAULT 'other', -- shipping_line, customs, gpha, trucking, warehouse, agent, office, other
  job_ref text,
  shipment_ref text,
  consolidation_ref text,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'GHS',
  exchange_rate numeric(10,4) DEFAULT 1,
  ghs_equivalent numeric(15,2) DEFAULT 0,
  due_date date,
  paid_date date,
  paid_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'pending', -- pending, approved, scheduled, paid, overdue, disputed
  invoice_number text,
  invoice_date date,
  payment_method text,
  bank_account text,
  approval_status text DEFAULT 'pending',
  approved_by text,
  approval_date date,
  icums_ref text,
  gpha_ref text,
  notes text,
  created_by text DEFAULT 'System',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_payables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view payables" ON public.finance_payables FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert payables" ON public.finance_payables FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update payables" ON public.finance_payables FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete payables" ON public.finance_payables FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.finance_receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text,
  invoice_number text NOT NULL,
  customer text NOT NULL,
  customer_id text NOT NULL,
  original_amount numeric(15,2) NOT NULL DEFAULT 0,
  paid_amount numeric(15,2) DEFAULT 0,
  outstanding_amount numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'GHS',
  ghs_equivalent numeric(15,2) DEFAULT 0,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  days_outstanding integer DEFAULT 0,
  aging_bucket text DEFAULT 'current', -- current, 1-30, 31-60, 61-90, 90+
  status text DEFAULT 'current', -- current, overdue, disputed, written_off
  last_payment_date date,
  last_contact_date date,
  collection_notes text,
  credit_status text DEFAULT 'good', -- good, watch, hold, suspend
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view receivables" ON public.finance_receivables FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert receivables" ON public.finance_receivables FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update receivables" ON public.finance_receivables FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete receivables" ON public.finance_receivables FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL DEFAULT 'GHS',
  rate numeric(10,4) NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view rates" ON public.exchange_rates FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can manage rates" ON public.exchange_rates FOR ALL USING (is_admin(auth.uid()));

CREATE TABLE public.tax_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type text NOT NULL, -- VAT, PAYE, Corporate, Withholding, Customs Duty
  period text NOT NULL,
  due_date date NOT NULL,
  filing_date date,
  amount numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'GHS',
  status text DEFAULT 'pending', -- pending, filed, paid, overdue
  reference_number text,
  payment_ref text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view tax filings" ON public.tax_filings FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert tax filings" ON public.tax_filings FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update tax filings" ON public.tax_filings FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete tax filings" ON public.tax_filings FOR DELETE USING (is_admin(auth.uid()));

CREATE TABLE public.registrar_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_type text NOT NULL, -- Annual Returns, Business Registration, Tax Clearance, etc.
  registrar_name text NOT NULL,
  description text,
  expiry_date date NOT NULL,
  renewal_date date,
  renewal_fee numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'GHS',
  status text DEFAULT 'active', -- active, expiring_soon, expired, renewed
  certificate_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrar_renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view renewals" ON public.registrar_renewals FOR SELECT USING (NOT is_client(auth.uid()));
CREATE POLICY "Staff can insert renewals" ON public.registrar_renewals FOR INSERT WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can update renewals" ON public.registrar_renewals FOR UPDATE USING (NOT is_client(auth.uid()));
CREATE POLICY "Admins can delete renewals" ON public.registrar_renewals FOR DELETE USING (is_admin(auth.uid()));

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consolidations_updated_at BEFORE UPDATE ON public.consolidations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consolidation_shippers_updated_at BEFORE UPDATE ON public.consolidation_shippers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON public.trucks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trucking_trips_updated_at BEFORE UPDATE ON public.trucking_trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_payments_updated_at BEFORE UPDATE ON public.finance_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_payables_updated_at BEFORE UPDATE ON public.finance_payables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_receivables_updated_at BEFORE UPDATE ON public.finance_receivables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tax_filings_updated_at BEFORE UPDATE ON public.tax_filings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registrar_renewals_updated_at BEFORE UPDATE ON public.registrar_renewals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_company_type ON public.customers(company_type);
CREATE INDEX idx_consolidations_status ON public.consolidations(status);
CREATE INDEX idx_consolidations_type ON public.consolidations(type);
CREATE INDEX idx_trucking_trips_status ON public.trucking_trips(status);
CREATE INDEX idx_finance_payments_type ON public.finance_payments(type);
CREATE INDEX idx_finance_payments_status ON public.finance_payments(status);
CREATE INDEX idx_finance_payables_status ON public.finance_payables(status);
CREATE INDEX idx_finance_receivables_status ON public.finance_receivables(status);
CREATE INDEX idx_finance_receivables_aging ON public.finance_receivables(aging_bucket);
