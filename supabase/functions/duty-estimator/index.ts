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

/** Deterministic duty calculation using Ghana GRA tax structure */
function calculateDuties(cifValue: number, dutyRatePercent: number) {
  const importDuty = round(cifValue * (dutyRatePercent / 100));
  const nhil = round((cifValue + importDuty) * 0.025);
  const getfund = round((cifValue + importDuty) * 0.025);
  const ecowasLevy = round(cifValue * 0.005);
  const auLevy = round(cifValue * 0.002);
  const eximLevy = round(cifValue * 0.0075);
  const processingFee = round(cifValue * 0.01);
  const vatBase = cifValue + importDuty + nhil + getfund + ecowasLevy + auLevy + eximLevy;
  const vat = round(vatBase * 0.15);
  const totalDuties = round(importDuty + vat + nhil + getfund + ecowasLevy + auLevy + eximLevy + processingFee);
  const totalLandedCost = round(cifValue + totalDuties);

  return { importDuty, vat, nhil, getfund, ecowasLevy, auLevy, eximLevy, processingFee, totalDuties, totalLandedCost };
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
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

    const exchangeRatePromise = userExchangeRate && userExchangeRate > 0
      ? Promise.resolve({ rate: userExchangeRate, source: "manual" })
      : getExchangeRate(currency || "USD");

    const cargoTypeInfo = cargo_type === "vehicle"
      ? `\nCargo Type: VEHICLE (Engine Capacity: ${engine_capacity || "Not specified"} cc)\nDetermine appropriate duty rate based on engine capacity and vehicle age. Ghana vehicle duty rates: 5%-35%.`
      : cargo_type === "consolidated_lcl"
      ? `\nCargo Type: CONSOLIDATED LCL`
      : cargo_type === "air_freight"
      ? `\nCargo Type: AIR FREIGHT`
      : `\nCargo Type: ${(cargo_type || "general").toUpperCase()}`;

    const systemPrompt = `You are a Ghana Customs HS code classification expert. Your ONLY job is to:
1. Determine the correct HS code for the goods
2. Determine the correct import duty rate percentage (0%, 5%, 10%, 20%, or 35%)
3. Flag if ECOWAS preferential rates may apply
4. Warn about potential misclassification

You do NOT need to calculate any duty amounts — that will be done programmatically.

For VEHICLES: duty rate depends on engine capacity and age:
- Engine ≤1000cc: 5%
- Engine 1001-2000cc: 10%  
- Engine 2001-3000cc: 20%
- Engine >3000cc: 35%
- Vehicles over 10 years old may attract additional levies

For ECOWAS origin goods: May qualify for 0% duty rate.

Always provide your best classification. If unsure, use the most common rate for the HS chapter.`;

    const userPrompt = `Classify this import and determine the duty rate:

- HS Code provided: ${hs_code || "NONE - determine from description"}
- Goods Description: ${goods_description || "Not provided"}
- Country of Origin: ${country_of_origin || "Not specified"}${cargoTypeInfo}

Return your classification using the classify_goods tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_goods",
            description: "Return HS code classification and duty rate for Ghana customs",
            parameters: {
              type: "object",
              properties: {
                hs_code: { type: "string", description: "The determined HS code (e.g. 8703.23)" },
                hs_description: { type: "string", description: "Description of the HS code tariff heading" },
                duty_rate_percent: { type: "number", description: "Import duty rate percentage (0, 5, 10, 20, or 35)" },
                ecowas_applicable: { type: "boolean", description: "Whether ECOWAS preferential rate may apply based on origin" },
                notes: { type: "string", description: "Classification notes, caveats, or uncertainties" },
                recommendations: { type: "string", description: "Cost-saving recommendations if any" },
                misclassification_warning: { type: "string", description: "Warning if the HS code might be misclassified" },
              },
              required: ["hs_code", "hs_description", "duty_rate_percent", "notes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_goods" } },
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

    if (!toolCall || toolCall.function.name !== "classify_goods") {
      return new Response(JSON.stringify({ error: "Failed to get classification from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const classification = JSON.parse(toolCall.function.arguments);
    const cifVal = cif_value || 0;
    
    // Apply ECOWAS zero rate if applicable
    const effectiveDutyRate = classification.ecowas_applicable ? 0 : classification.duty_rate_percent;
    
    // Calculate all duties deterministically
    const calc = calculateDuties(cifVal, effectiveDutyRate);

    const estimate = {
      hs_code: classification.hs_code,
      hs_description: classification.hs_description,
      duty_rate_percent: effectiveDutyRate,
      cif_value: cifVal,
      import_duty: calc.importDuty,
      vat: calc.vat,
      nhil: calc.nhil,
      getfund: calc.getfund,
      ecowas_levy: calc.ecowasLevy,
      au_levy: calc.auLevy,
      exim_levy: calc.eximLevy,
      processing_fee: calc.processingFee,
      total_duties: calc.totalDuties,
      total_landed_cost: calc.totalLandedCost,
      currency: currency || "USD",
      notes: classification.notes,
      ecowas_applicable: classification.ecowas_applicable || false,
      recommendations: classification.recommendations || "",
      misclassification_warning: classification.misclassification_warning || "",
    };

    const { rate: exchangeRate, source: rateSource } = await exchangeRatePromise;
    const convert = (val: number) => round((val || 0) * exchangeRate);

    const ghsConversion = {
      exchange_rate: exchangeRate,
      rate_source: rateSource,
      from_currency: currency || "USD",
      ghs_cif_value: convert(estimate.cif_value),
      ghs_import_duty: convert(estimate.import_duty),
      ghs_vat: convert(estimate.vat),
      ghs_nhil: convert(estimate.nhil),
      ghs_getfund: convert(estimate.getfund),
      ghs_ecowas_levy: convert(estimate.ecowas_levy),
      ghs_au_levy: convert(estimate.au_levy),
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
