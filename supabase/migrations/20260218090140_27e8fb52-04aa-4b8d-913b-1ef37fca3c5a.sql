
-- Finance Invoices table (revenue side)
CREATE TABLE public.finance_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text NOT NULL,
  invoice_type text NOT NULL DEFAULT 'commercial', -- proforma, commercial, credit_note, debit_note
  customer text NOT NULL,
  customer_id text NOT NULL,
  shipment_ref text,
  consolidation_ref text,
  job_ref text,
  description text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  exchange_rate numeric NOT NULL DEFAULT 1,
  ghs_equivalent numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', -- draft, sent, partially_paid, paid, overdue, cancelled, disputed
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  paid_date date,
  paid_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  created_by text NOT NULL DEFAULT 'System',
  approved_by text,
  approval_date date,
  service_type text NOT NULL DEFAULT 'other', -- freight_forwarding, customs_clearing, trucking, warehousing, agency_fee
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view finance invoices"
  ON public.finance_invoices FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert finance invoices"
  ON public.finance_invoices FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update finance invoices"
  ON public.finance_invoices FOR UPDATE
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete finance invoices"
  ON public.finance_invoices FOR DELETE
  USING (is_admin(auth.uid()));

-- Finance Expenses table (OPEX)
CREATE TABLE public.finance_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_ref text NOT NULL,
  category text NOT NULL DEFAULT 'other', -- salaries, rent, utilities, vehicle, admin, bank_charges, other
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  exchange_rate numeric NOT NULL DEFAULT 1,
  ghs_equivalent numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, paid, rejected
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  paid_date date,
  requested_by text NOT NULL DEFAULT 'System',
  approved_by text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view finance expenses"
  ON public.finance_expenses FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert finance expenses"
  ON public.finance_expenses FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update finance expenses"
  ON public.finance_expenses FOR UPDATE
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete finance expenses"
  ON public.finance_expenses FOR DELETE
  USING (is_admin(auth.uid()));

-- Finance Job Costs table (cost of sales)
CREATE TABLE public.finance_job_costs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_ref text NOT NULL,
  job_type text NOT NULL DEFAULT 'shipment', -- shipment, consolidation, container
  shipment_ref text,
  consolidation_ref text,
  customer text NOT NULL,
  customer_id text NOT NULL,
  cost_category text NOT NULL DEFAULT 'other',
  description text NOT NULL,
  vendor text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  exchange_rate numeric NOT NULL DEFAULT 1,
  ghs_equivalent numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid', -- unpaid, partially_paid, paid
  due_date date,
  paid_date date,
  paid_amount numeric NOT NULL DEFAULT 0,
  is_reimbursable boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by text,
  created_by text NOT NULL DEFAULT 'System',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_job_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view finance job costs"
  ON public.finance_job_costs FOR SELECT
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Staff can insert finance job costs"
  ON public.finance_job_costs FOR INSERT
  WITH CHECK (NOT is_client(auth.uid()));

CREATE POLICY "Staff can update finance job costs"
  ON public.finance_job_costs FOR UPDATE
  USING (NOT is_client(auth.uid()));

CREATE POLICY "Admins can delete finance job costs"
  ON public.finance_job_costs FOR DELETE
  USING (is_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_finance_invoices_updated_at
  BEFORE UPDATE ON public.finance_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_expenses_updated_at
  BEFORE UPDATE ON public.finance_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_job_costs_updated_at
  BEFORE UPDATE ON public.finance_job_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed sample data into finance_invoices (matching the mock data)
INSERT INTO public.finance_invoices (invoice_number, invoice_type, customer, customer_id, shipment_ref, job_ref, description, subtotal, tax_amount, total_amount, currency, exchange_rate, ghs_equivalent, status, issue_date, due_date, paid_date, paid_amount, payment_method, created_by, approved_by, service_type) VALUES
('SLAC-2026-0001', 'commercial', 'Ghana Cocoa Board', 'CUST001', 'BL-HLCU123456789', 'JOB-2026-001', 'Sea freight and clearing services', 45000, 5625, 50625, 'GHS', 1, 50625, 'paid', '2026-01-05', '2026-01-20', '2026-01-18', 50625, 'bank_transfer', 'Kofi Mensah', 'Ama Serwaa', 'freight_forwarding'),
('SLAC-2026-0002', 'commercial', 'Nestle Ghana Ltd', 'CUST002', 'BL-OOLU987654321', 'JOB-2026-002', 'Import clearing and trucking services', 28000, 3500, 31500, 'GHS', 1, 31500, 'sent', '2026-01-15', '2026-01-30', NULL, 0, NULL, 'Kwame Asante', NULL, 'customs_clearing'),
('SLAC-2026-0003', 'commercial', 'Unilever Ghana', 'CUST003', NULL, 'JOB-2026-003', 'Warehousing and distribution services', 18500, 2312, 20812, 'GHS', 1, 20812, 'overdue', '2026-01-01', '2026-01-15', NULL, 0, NULL, 'Kofi Mensah', NULL, 'warehousing'),
('SLAC-2026-0004', 'commercial', 'MTN Ghana', 'CUST004', 'AWB-78901234', 'JOB-2026-004', 'Air freight import - Telecom equipment', 85000, 10625, 95625, 'GHS', 1, 95625, 'sent', '2026-01-20', '2026-02-04', NULL, 0, NULL, 'Ama Serwaa', NULL, 'freight_forwarding'),
('SLAC-2026-0005', 'proforma', 'Kasapreko Ltd', 'CUST005', NULL, 'JOB-2026-005', 'Export documentation and handling', 5500, 687, 6187, 'GHS', 1, 6187, 'draft', '2026-01-22', '2026-02-06', NULL, 0, NULL, 'Kwame Asante', NULL, 'customs_clearing'),
('SLAC-2026-0006', 'commercial', 'Guinness Ghana', 'CUST006', 'BL-COSCO2026001', 'JOB-2026-006', 'FCL sea freight and port handling', 62000, 7750, 69750, 'GHS', 1, 69750, 'paid', '2026-02-01', '2026-02-15', '2026-02-12', 69750, 'bank_transfer', 'Kofi Mensah', 'Ama Serwaa', 'freight_forwarding'),
('SLAC-2026-0007', 'commercial', 'Accra Brewery Ltd', 'CUST007', NULL, 'JOB-2026-007', 'Trucking and distribution - Central region', 18000, 2250, 20250, 'GHS', 1, 20250, 'paid', '2026-02-03', '2026-02-17', '2026-02-10', 20250, 'bank_transfer', 'Kwame Asante', 'Kofi Mensah', 'trucking'),
('SLAC-2026-0008', 'commercial', 'Stanbic Bank Ghana', 'CUST008', 'AWB-98765432', 'JOB-2026-008', 'Air freight - banking equipment', 48000, 6000, 54000, 'GHS', 1, 54000, 'partially_paid', '2026-02-05', '2026-02-20', NULL, 27000, 'mobile_money', 'Ama Serwaa', NULL, 'freight_forwarding');

-- Seed sample expenses
INSERT INTO public.finance_expenses (expense_ref, category, description, amount, currency, exchange_rate, ghs_equivalent, status, expense_date, paid_date, requested_by, approved_by) VALUES
('EXP-2026-001', 'salaries', 'Staff salaries - February 2026', 42000, 'GHS', 1, 42000, 'paid', '2026-02-01', '2026-02-01', 'HR Dept', 'MD Office'),
('EXP-2026-002', 'rent', 'Office rent - Tema, February', 15000, 'GHS', 1, 15000, 'paid', '2026-02-01', '2026-02-02', 'Admin', 'MD Office'),
('EXP-2026-003', 'utilities', 'ECG electricity bill - February', 3500, 'GHS', 1, 3500, 'paid', '2026-02-05', '2026-02-06', 'Admin', 'Accounts'),
('EXP-2026-004', 'vehicle', 'Fuel and vehicle maintenance - February', 8200, 'GHS', 1, 8200, 'paid', '2026-02-10', '2026-02-10', 'Fleet Manager', 'Accounts'),
('EXP-2026-005', 'admin', 'Office supplies and stationery', 2100, 'GHS', 1, 2100, 'approved', '2026-02-12', NULL, 'Admin', 'Accounts'),
('EXP-2026-006', 'bank_charges', 'Bank transfer charges and commissions', 1850, 'GHS', 1, 1850, 'paid', '2026-02-14', '2026-02-14', 'Accounts', 'CFO');

-- Seed sample job costs
INSERT INTO public.finance_job_costs (job_ref, job_type, shipment_ref, customer, customer_id, cost_category, description, vendor, amount, currency, exchange_rate, ghs_equivalent, payment_status, paid_date, paid_amount, is_reimbursable, approval_status, approved_by, created_by) VALUES
('JOB-2026-006', 'shipment', 'BL-COSCO2026001', 'Guinness Ghana', 'CUST006', 'freight_sea', 'Ocean Freight - COSCO Shipping', 'COSCO', 2800, 'USD', 15.50, 43400, 'paid', '2026-02-10', 43400, true, 'approved', 'Ama Serwaa', 'Kofi Mensah'),
('JOB-2026-006', 'shipment', 'BL-COSCO2026001', 'Guinness Ghana', 'CUST006', 'gpha_charges', 'GPHA Terminal Handling', 'GPHA', 7200, 'GHS', 1, 7200, 'paid', '2026-02-11', 7200, true, 'approved', 'Ama Serwaa', 'Kofi Mensah'),
('JOB-2026-007', 'shipment', NULL, 'Accra Brewery Ltd', 'CUST007', 'trucking', 'Transport - Tema to Kumasi', 'SLAC Fleet', 12000, 'GHS', 1, 12000, 'paid', '2026-02-09', 12000, true, 'approved', 'Kofi Mensah', 'Kwame Asante'),
('JOB-2026-008', 'shipment', 'AWB-98765432', 'Stanbic Bank Ghana', 'CUST008', 'freight_air', 'Air Freight - Ethiopian Airlines', 'Ethiopian Airlines', 2600, 'USD', 15.50, 40300, 'unpaid', NULL, 0, true, 'approved', 'Ama Serwaa', 'Kwame Asante'),
('JOB-2026-008', 'shipment', 'AWB-98765432', 'Stanbic Bank Ghana', 'CUST008', 'customs_duty', 'Customs Duty Payment - GRA', 'GRA Customs', 9500, 'GHS', 1, 9500, 'paid', '2026-02-08', 9500, true, 'approved', 'Ama Serwaa', 'Kofi Mensah');
