
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS tin_number text,
  ADD COLUMN IF NOT EXISTS warehouse_destinations text[] NOT NULL DEFAULT '{}';
