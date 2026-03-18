ALTER TABLE public.trucking_trips 
ADD COLUMN advance_deposit numeric DEFAULT 0,
ADD COLUMN trip_cost_paid boolean DEFAULT false;