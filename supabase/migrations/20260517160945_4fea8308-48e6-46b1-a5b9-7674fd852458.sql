
-- 1) POD geo fields
ALTER TABLE public.trucking_trips
  ADD COLUMN IF NOT EXISTS pod_lat numeric,
  ADD COLUMN IF NOT EXISTS pod_lng numeric,
  ADD COLUMN IF NOT EXISTS pod_distance_m numeric,
  ADD COLUMN IF NOT EXISTS pod_captured_at timestamptz;

-- 2) Haversine helper (metres)
CREATE OR REPLACE FUNCTION public.haversine_m(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  r constant numeric := 6371000;
  dlat numeric; dlon numeric; a numeric; c numeric;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$;

-- 3) Strengthen lifecycle trigger
CREATE OR REPLACE FUNCTION public.enforce_trip_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old text;
  v_new text;
  v_allowed boolean := false;
  v_dist numeric;
BEGIN
  v_old := COALESCE(OLD.status, 'scheduled');
  v_new := NEW.status;
  IF v_old = v_new THEN RETURN NEW; END IF;

  v_allowed := CASE
    WHEN v_old = 'scheduled'  AND v_new IN ('in_transit','cancelled') THEN true
    WHEN v_old = 'in_transit' AND v_new IN ('delivered','cancelled')  THEN true
    WHEN v_old = 'delivered'  AND v_new IN ('completed')              THEN true
    ELSE false
  END;
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid trip status transition: % -> %', v_old, v_new
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_new = 'in_transit' AND NEW.actual_start_time IS NULL THEN
    NEW.actual_start_time := now();
  END IF;

  IF v_new = 'delivered' THEN
    -- Require proof artefact
    IF COALESCE(NEW.pod_url,'') = '' THEN
      RAISE EXCEPTION 'POD photo or signature is required to mark trip delivered'
        USING ERRCODE = 'check_violation';
    END IF;
    -- Require POD GPS
    IF NEW.pod_lat IS NULL OR NEW.pod_lng IS NULL THEN
      RAISE EXCEPTION 'POD GPS location is required to mark trip delivered'
        USING ERRCODE = 'check_violation';
    END IF;
    -- Require delivery point on file
    IF NEW.delivery_lat IS NULL OR NEW.delivery_lng IS NULL THEN
      RAISE EXCEPTION 'Delivery location coordinates missing — cannot geo-verify POD'
        USING ERRCODE = 'check_violation';
    END IF;
    -- Geofence check (950m)
    v_dist := public.haversine_m(NEW.pod_lat, NEW.pod_lng, NEW.delivery_lat, NEW.delivery_lng);
    NEW.pod_distance_m := v_dist;
    IF v_dist > 950 THEN
      RAISE EXCEPTION 'POD location is % m from delivery point (max 950 m). Move closer or correct delivery address.', round(v_dist)
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.pod_captured_at IS NULL THEN
      NEW.pod_captured_at := now();
    END IF;
    IF NEW.actual_end_time IS NULL THEN
      NEW.actual_end_time := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Storage bucket for POD artefacts
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-pods','trip-pods', false)
ON CONFLICT (id) DO NOTHING;

-- 5) Storage policies (staff = non-client)
DROP POLICY IF EXISTS "Staff can view POD files" ON storage.objects;
CREATE POLICY "Staff can view POD files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-pods' AND NOT is_client(auth.uid()));

DROP POLICY IF EXISTS "Staff can upload POD files" ON storage.objects;
CREATE POLICY "Staff can upload POD files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trip-pods' AND NOT is_client(auth.uid()));

DROP POLICY IF EXISTS "Staff can update POD files" ON storage.objects;
CREATE POLICY "Staff can update POD files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'trip-pods' AND NOT is_client(auth.uid()));
