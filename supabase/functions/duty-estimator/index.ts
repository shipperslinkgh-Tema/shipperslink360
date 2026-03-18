import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fallback rates in case the API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  USD: 15.5,
  EUR: 17.0,
  GBP: 19.5,
  CNY: 2.15,
  GHS: 1,
};

async function getExchangeRate(fromCurrency: string): Promise<{ rate: number; source: string }> {
  if (fromCurrency === "GHS") {
    return { rate: 1, source: "direct" };
  }

  try {
    // Use the free exchangerate.host API (no key required)
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${fromCurrency}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.GHS) {
        return { rate: data.rates.GHS, source: "live" };
      }
    }
  } catch (e) {
    console.warn("Exchange rate API failed, using fallback:", e);
  }

  const fallback = FALLBACK_RATES[fromCurrency];
  if (fallback) {
    return { rate: fallback, source: "fallback" };
  }
  return { rate: 15.5, source: "default" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hs_code, cif_value, freight_value, insurance_value, fob_value, country_of_origin, goods_description, currency } = await req.json();

    if (!hs_code || !cif_value) {
      return new Response(
        JSON.stringify({ error: "HS Code and CIF value are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch exchange rate in parallel with AI call preparation
    const exchangeRatePromise = getExchangeRate(currency || "USD");

    const systemPrompt = `You are a Ghana Customs duty estimation expert. You have deep knowledge of:
- Ghana Revenue Authority (GRA) import duty rates by HS Code
- Ghana ICUMS (Integrated Customs Management System) procedures
- Ghana tax structure: Import Duty, VAT (15%), NHIL (2.5%), GETFund Levy (2.5%), EXIM Levy (0.75%), Processing Fee (1%)
- ECOWAS CET (Common External Tariff) rates
- Preferential trade agreements affecting Ghana

When given an HS Code, CIF value, and other details, estimate the customs duties accurately.

IMPORTANT RULES:
1. Use the CORRECT duty rate for the specific HS code. Common rates: 0%, 5%, 10%, 20%, 35%
2. Import Duty = CIF Value × Duty Rate
3. VAT (15%) is calculated on (CIF Value + Import Duty + NHIL + GETFund + EXIM Levy)
4. NHIL (2.5%) is calculated on (CIF Value + Import Duty)
5. GETFund Levy (2.5%) is calculated on (CIF Value + Import Duty)
6. EXIM Levy (0.75%) is calculated on CIF Value
7. Processing Fee (1%) is calculated on CIF Value
8. Total = Import Duty + VAT + NHIL + GETFund + EXIM Levy + Processing Fee

Always provide your best estimate based on the HS code. If unsure of the exact rate, use the most common rate for that HS chapter and note the uncertainty.`;

    const userPrompt = `Estimate Ghana customs duties for this import:

- HS Code: ${hs_code}
- Goods Description: ${goods_description || "Not provided"}
- FOB Value: ${currency || "USD"} ${fob_value || "N/A"}
- Freight: ${currency || "USD"} ${freight_value || "0"}
- Insurance: ${currency || "USD"} ${insurance_value || "0"}
- CIF Value: ${currency || "USD"} ${cif_value}
- Country of Origin: ${country_of_origin || "Not specified"}

Return your response using the suggest_duties tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
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
                  exim_levy: { type: "number", description: "EXIM Levy (0.75%) amount" },
                  processing_fee: { type: "number", description: "Processing Fee (1%) amount" },
                  total_duties: { type: "number", description: "Total estimated duties payable" },
                  total_landed_cost: { type: "number", description: "CIF + Total Duties" },
                  currency: { type: "string", description: "Currency of all amounts" },
                  notes: { type: "string", description: "Any caveats, uncertainties, or special notes about the estimate" },
                  ecowas_applicable: { type: "boolean", description: "Whether ECOWAS preferential rate may apply" },
                },
                required: [
                  "hs_code", "hs_description", "duty_rate_percent", "cif_value",
                  "import_duty", "vat", "nhil", "getfund", "exim_levy",
                  "processing_fee", "total_duties", "total_landed_cost", "currency", "notes"
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_duties" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "suggest_duties") {
      return new Response(
        JSON.stringify({ error: "Failed to get structured estimate from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const estimate = JSON.parse(toolCall.function.arguments);

    // Get exchange rate result
    const { rate: exchangeRate, source: rateSource } = await exchangeRatePromise;

    // Add GHS equivalents
    const ghsConversion = {
      exchange_rate: exchangeRate,
      rate_source: rateSource,
      from_currency: currency || "USD",
      ghs_cif_value: Math.round(estimate.cif_value * exchangeRate * 100) / 100,
      ghs_import_duty: Math.round(estimate.import_duty * exchangeRate * 100) / 100,
      ghs_vat: Math.round(estimate.vat * exchangeRate * 100) / 100,
      ghs_nhil: Math.round(estimate.nhil * exchangeRate * 100) / 100,
      ghs_getfund: Math.round(estimate.getfund * exchangeRate * 100) / 100,
      ghs_exim_levy: Math.round(estimate.exim_levy * exchangeRate * 100) / 100,
      ghs_processing_fee: Math.round(estimate.processing_fee * exchangeRate * 100) / 100,
      ghs_total_duties: Math.round(estimate.total_duties * exchangeRate * 100) / 100,
      ghs_total_landed_cost: Math.round(estimate.total_landed_cost * exchangeRate * 100) / 100,
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
