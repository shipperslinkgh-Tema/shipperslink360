
-- Trip tracking extensions to existing trucking_trips table
ALTER TABLE public.trucking_trips
  ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS tracking_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS delivery_location TEXT,
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS driver_phone TEXT,
  ADD COLUMN IF NOT EXISTS truck_number TEXT,
  ADD COLUMN IF NOT EXISTS cargo_description TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS arrived_at_pickup_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_otp TEXT,
  ADD COLUMN IF NOT EXISTS delivery_confirmed_by TEXT,
  ADD COLUMN IF NOT EXISTS pod_url TEXT;

-- GPS tracking logs
CREATE TABLE IF NOT EXISTS public.trip_gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trucking_trips(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed NUMERIC DEFAULT 0,
  heading NUMERIC DEFAULT 0,
  accuracy NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast GPS queries
CREATE INDEX IF NOT EXISTS idx_gps_logs_trip_id ON public.trip_gps_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_recorded_at ON public.trip_gps_logs(trip_id, recorded_at DESC);

-- Tracking token index
CREATE INDEX IF NOT EXISTS idx_tracking_token ON public.trucking_trips(tracking_token);

-- Enable RLS on gps logs
ALTER TABLE public.trip_gps_logs ENABLE ROW LEVEL SECURITY;

-- GPS logs policies - staff can manage, public can read via tracking token (handled in app)
CREATE POLICY "Staff can insert gps logs" ON public.trip_gps_logs FOR INSERT TO public WITH CHECK (NOT is_client(auth.uid()));
CREATE POLICY "Staff can view gps logs" ON public.trip_gps_logs FOR SELECT TO public USING (NOT is_client(auth.uid()));

-- Enable realtime for GPS logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_gps_logs;
