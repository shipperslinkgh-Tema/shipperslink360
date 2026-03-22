import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_RATES: Record<string, number> = {
  USD: 15.5, EUR: 17.0, GBP: 19.5, CNY: 2.15, GHS: 1,
};

async function getExchangeRate(fromCurrency: string): Promise<{ rate: number; source: string }> {
  if (fromCurrency === "GHS") return { rate: 1, source: "direct" };
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.GHS) return { rate: data.rates.GHS, source: "live" };
    }
  } catch (e) { console.warn("Exchange rate API failed:", e); }
  return { rate: FALLBACK_RATES[fromCurrency] ?? 15.5, source: FALLBACK_RATES[fromCurrency] ? "fallback" : "default" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { hs_code, cif_value, freight_value, insurance_value, fob_value, country_of_origin, goods_description, currency, cargo_type, engine_capacity, exchange_rate: userExchangeRate } = body;

    if (!cif_value && !goods_description) {
      return new Response(JSON.stringify({ error: "CIF value or goods description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const exchangeRatePromise = getExchangeRate(currency || "USD");

    const cargoTypeInfo = cargo_type === "vehicle"
      ? `\nCargo Type: VEHICLE (Engine Capacity: ${engine_capacity || "Not specified"} cc)\nFor vehicles, apply the appropriate duty rate based on engine capacity and age. Ghana vehicle duty rates vary: 5%-35% import duty depending on vehicle type, plus additional levies.`
      : cargo_type === "consolidated_lcl"
      ? `\nCargo Type: CONSOLIDATED LCL (Less than Container Load)`
      : cargo_type === "air_freight"
      ? `\nCargo Type: AIR FREIGHT`
      : `\nCargo Type: ${(cargo_type || "general").toUpperCase()}`;

    const systemPrompt = `You are a Ghana Customs duty estimation expert with deep knowledge of:
- Ghana Revenue Authority (GRA) import duty rates by HS Code
- Ghana ICUMS (Integrated Customs Management System) procedures
- Ghana tax structure including all applicable levies
- ECOWAS CET (Common External Tariff) rates
- Vehicle import duties (based on engine capacity and age)
- Preferential trade agreements affecting Ghana

TAX CALCULATION RULES:
1. Determine the correct HS code and duty rate (0%, 5%, 10%, 20%, 35%)
2. Import Duty = CIF Value × Duty Rate
3. NHIL (2.5%) = (CIF Value + Import Duty) × 0.025
4. GETFund Levy (2.5%) = (CIF Value + Import Duty) × 0.025
5. ECOWAS Levy (0.5%) = CIF Value × 0.005
6. AU Levy (0.2%) = CIF Value × 0.002
7. EXIM Levy (0.75%) = CIF Value × 0.0075
8. Processing Fee (1%) = CIF Value × 0.01
9. VAT (15%) = (CIF Value + Import Duty + NHIL + GETFund + ECOWAS Levy + AU Levy + EXIM Levy) × 0.15
10. Total Duties = Import Duty + VAT + NHIL + GETFund + ECOWAS Levy + AU Levy + EXIM Levy + Processing Fee
11. Total Landed Cost = CIF Value + Total Duties

For VEHICLES: Consider engine capacity for duty classification. Vehicles over 10 years may attract higher rates.
For ECOWAS origin goods: May qualify for reduced or zero duty rates.

Always provide your best estimate. If unsure, use the most common rate for the HS chapter and note the uncertainty.
Include cost-saving recommendations where applicable (e.g., ECOWAS preferential rates, consolidation benefits).`;

    const userPrompt = `Estimate Ghana customs duties for this import:

- HS Code: ${hs_code || "AUTO-DETERMINE from description"}
- Goods Description: ${goods_description || "Not provided"}
- FOB Value: ${currency || "USD"} ${fob_value || "N/A"}
- Freight: ${currency || "USD"} ${freight_value || "0"}
- Insurance: ${currency || "USD"} ${insurance_value || "0"}
- CIF Value: ${currency || "USD"} ${cif_value}
- Country of Origin: ${country_of_origin || "Not specified"}${cargoTypeInfo}

Return your response using the suggest_duties tool. If no HS code was provided, determine the best one from the description.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_duties",
            description: "Return structured duty estimation breakdown for Ghana customs",
            parameters: {
              type: "object",
              properties: {
                hs_code: { type: "string", description: "The HS code used" },
                hs_description: { type: "string", description: "Description of the HS code tariff heading" },
                duty_rate_percent: { type: "number", description: "Import duty rate percentage applied" },
                cif_value: { type: "number", description: "CIF value in the given currency" },
                import_duty: { type: "number", description: "Import Duty amount" },
                vat: { type: "number", description: "VAT (15%) amount" },
                nhil: { type: "number", description: "NHIL (2.5%) amount" },
                getfund: { type: "number", description: "GETFund Levy (2.5%) amount" },
                ecowas_levy: { type: "number", description: "ECOWAS Levy (0.5%) amount" },
                au_levy: { type: "number", description: "AU Levy (0.2%) amount" },
                exim_levy: { type: "number", description: "EXIM Levy (0.75%) amount" },
                processing_fee: { type: "number", description: "Processing Fee (1%) amount" },
                total_duties: { type: "number", description: "Total estimated duties payable" },
                total_landed_cost: { type: "number", description: "CIF + Total Duties" },
                currency: { type: "string", description: "Currency of all amounts" },
                notes: { type: "string", description: "Any caveats, uncertainties, or special notes" },
                ecowas_applicable: { type: "boolean", description: "Whether ECOWAS preferential rate may apply" },
                recommendations: { type: "string", description: "Cost-saving recommendations if any" },
                misclassification_warning: { type: "string", description: "Warning if the HS code might be misclassified" },
              },
              required: [
                "hs_code", "hs_description", "duty_rate_percent", "cif_value",
                "import_duty", "vat", "nhil", "getfund", "ecowas_levy", "au_levy",
                "exim_levy", "processing_fee", "total_duties", "total_landed_cost",
                "currency", "notes"
              ],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_duties" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "suggest_duties") {
      return new Response(JSON.stringify({ error: "Failed to get structured estimate from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const estimate = JSON.parse(toolCall.function.arguments);
    const { rate: exchangeRate, source: rateSource } = await exchangeRatePromise;

    const convert = (val: number) => Math.round((val || 0) * exchangeRate * 100) / 100;

    const ghsConversion = {
      exchange_rate: exchangeRate,
      rate_source: rateSource,
      from_currency: currency || "USD",
      ghs_cif_value: convert(estimate.cif_value),
      ghs_import_duty: convert(estimate.import_duty),
      ghs_vat: convert(estimate.vat),
      ghs_nhil: convert(estimate.nhil),
      ghs_getfund: convert(estimate.getfund),
      ghs_ecowas_levy: convert(estimate.ecowas_levy || 0),
      ghs_au_levy: convert(estimate.au_levy || 0),
      ghs_exim_levy: convert(estimate.exim_levy),
      ghs_processing_fee: convert(estimate.processing_fee),
      ghs_total_duties: convert(estimate.total_duties),
      ghs_total_landed_cost: convert(estimate.total_landed_cost),
    };

    return new Response(
      JSON.stringify({ success: true, estimate, ghs_conversion: ghsConversion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("duty-estimator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
