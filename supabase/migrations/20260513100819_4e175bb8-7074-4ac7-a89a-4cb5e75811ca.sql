-- FX rates cache table
CREATE TABLE public.fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL,
  quote_currency text NOT NULL DEFAULT 'GHS',
  rate numeric(18,6) NOT NULL,
  source text NOT NULL DEFAULT 'exchangerate.host',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  rate_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (base_currency, quote_currency, rate_date)
);

CREATE INDEX idx_fx_rates_lookup ON public.fx_rates (base_currency, quote_currency, rate_date DESC);

ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read rates
CREATE POLICY "Authenticated users can read fx rates"
  ON public.fx_rates FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can write (edge function uses service role)
CREATE POLICY "Service role manages fx rates"
  ON public.fx_rates FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
