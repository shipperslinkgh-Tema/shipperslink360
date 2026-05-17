ALTER TABLE public.trucking_trips
  ADD COLUMN IF NOT EXISTS pickup_lat numeric,
  ADD COLUMN IF NOT EXISTS pickup_lng numeric,
  ADD COLUMN IF NOT EXISTS delivery_lat numeric,
  ADD COLUMN IF NOT EXISTS delivery_lng numeric,
  ADD COLUMN IF NOT EXISTS route_polyline text,
  ADD COLUMN IF NOT EXISTS route_eta_seconds integer,
  ADD COLUMN IF NOT EXISTS cost_per_km numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS toll_cost numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS misc_cost numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consignment_id uuid;

CREATE INDEX IF NOT EXISTS idx_trucking_trips_consignment ON public.trucking_trips(consignment_id);