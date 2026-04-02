import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goods_description } = await req.json();

    if (!goods_description?.trim()) {
      return new Response(
        JSON.stringify({ error: "Goods description is required" }),
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a senior Ghana customs tariff classification expert with comprehensive knowledge of the Harmonized System (HS), Ghana Revenue Authority (GRA) tariff schedule, and ECOWAS Common External Tariff (CET).

Given a goods description, suggest up to 5 most likely HS codes. Rank by likelihood, with the most probable first.

IMPORTANT RULES:
- Use 6-10 digit HS codes as used by Ghana Customs/ICUMS
- Duty rates must be from Ghana's actual tariff bands: 0%, 5%, 10%, 20%, or 35%
- Consider the specific form, material, and end-use of the goods
- If the description is vague, suggest codes for the most common interpretations
- Mark confidence as "high" only when you are very certain of the classification
- Always consider whether the goods might fall under a more specific subheading`,
          },
          {
            role: "user",
            content: `Suggest the most accurate HS codes for Ghana customs classification of: "${goods_description}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_hs_codes",
              description: "Return a ranked list of suggested HS codes for the given goods description",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        hs_code: { type: "string", description: "HS code (6-10 digits with dots, e.g. 8471.30.00)" },
                        description: { type: "string", description: "Tariff heading description as it appears in Ghana's schedule" },
                        duty_rate: { type: "number", description: "Ghana import duty rate % (0, 5, 10, 20, or 35)" },
                        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Classification confidence level" },
                      },
                      required: ["hs_code", "description", "duty_rate", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_hs_codes" } },
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

    if (!toolCall || toolCall.function.name !== "suggest_hs_codes") {
      return new Response(
        JSON.stringify({ error: "Failed to get HS code suggestions from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, suggestions: result.suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("suggest-hs-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
