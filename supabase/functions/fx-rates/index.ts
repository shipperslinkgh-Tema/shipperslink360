import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPPORTED = ["USD", "EUR", "GBP", "CNY"];
const QUOTE = "GHS";

async function fetchRates(): Promise<Record<string, number>> {
  // Primary: Frankfurter (ECB data, free, no key) - but doesn't include GHS reliably.
  // Use exchangerate.host (free, no key) which supports GHS.
  const url = `https://api.exchangerate.host/latest?base=${QUOTE}&symbols=${SUPPORTED.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FX provider returned ${res.status}`);
  const data = await res.json();
  if (!data?.rates) throw new Error("No rates in provider response");
  // data.rates = { USD: 0.0xx, EUR: ... } meaning 1 GHS = X foreign
  // We want 1 FOREIGN = ? GHS, so invert.
  const out: Record<string, number> = {};
  for (const sym of SUPPORTED) {
    const inv = data.rates[sym];
    if (inv && inv > 0) out[sym] = 1 / inv;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const today = new Date().toISOString().slice(0, 10);

    // Return cached if fresh (today)
    const { data: cached } = await supabase
      .from("fx_rates")
      .select("base_currency, rate, fetched_at")
      .eq("quote_currency", QUOTE)
      .eq("rate_date", today);

    let rates: Record<string, number> = {};
    if (cached && cached.length >= SUPPORTED.length) {
      for (const r of cached) rates[r.base_currency] = Number(r.rate);
      return new Response(JSON.stringify({ rates, cached: true, date: today }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch live and upsert
    rates = await fetchRates();
    const rows = Object.entries(rates).map(([base, rate]) => ({
      base_currency: base,
      quote_currency: QUOTE,
      rate,
      source: "exchangerate.host",
      rate_date: today,
      fetched_at: new Date().toISOString(),
    }));
    await supabase.from("fx_rates").upsert(rows, { onConflict: "base_currency,quote_currency,rate_date" });

    return new Response(JSON.stringify({ rates, cached: false, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fx-rates error", err);
    // Fallback: return last known rates if any
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: latest } = await supabase
        .from("fx_rates")
        .select("base_currency, rate, rate_date")
        .eq("quote_currency", QUOTE)
        .order("rate_date", { ascending: false })
        .limit(20);
      const rates: Record<string, number> = {};
      const seen = new Set<string>();
      for (const r of latest ?? []) {
        if (!seen.has(r.base_currency)) { rates[r.base_currency] = Number(r.rate); seen.add(r.base_currency); }
      }
      return new Response(JSON.stringify({ rates, cached: true, fallback: true, error: String(err) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
});
