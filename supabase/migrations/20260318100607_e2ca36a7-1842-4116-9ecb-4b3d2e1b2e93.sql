
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS customer_code text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS warehouse_destinations text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS notes text;

-- Auto-generate customer_code for existing rows without one
UPDATE public.customers 
SET customer_code = 'CUST-' || LPAD(ROW_NUMBER::text, 4, '0')
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) FROM public.customers WHERE customer_code IS NULL) sub
WHERE customers.id = sub.id;

-- Create a function to auto-generate customer_code on insert
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(customer_code, '[^0-9]', '', 'g'), '')::integer), 0) + 1
  INTO next_num
  FROM public.customers;
  
  NEW.customer_code := 'CUST-' || LPAD(next_num::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_generate_customer_code
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  WHEN (NEW.customer_code IS NULL)
  EXECUTE FUNCTION public.generate_customer_code();
