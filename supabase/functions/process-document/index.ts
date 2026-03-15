import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTRACTION_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "extract_document_data",
      description: "Extract structured shipping document data from the provided document image or text.",
      parameters: {
        type: "object",
        properties: {
          document_type: {
            type: "string",
            enum: ["bill_of_lading", "commercial_invoice", "packing_list", "air_waybill", "unknown"],
            description: "The detected type of shipping document",
          },
          shipper_name: { type: "string", description: "Name of the shipper/exporter" },
          consignee_name: { type: "string", description: "Name of the consignee/importer" },
          notify_party: { type: "string", description: "Notify party name" },
          bl_number: { type: "string", description: "Bill of Lading number" },
          awb_number: { type: "string", description: "Air Waybill number" },
          container_number: { type: "string", description: "Container number(s)" },
          vessel_name: { type: "string", description: "Vessel/ship name" },
          voyage_number: { type: "string", description: "Voyage number" },
          flight_number: { type: "string", description: "Flight number for air freight" },
          port_of_loading: { type: "string", description: "Port of loading/origin" },
          port_of_discharge: { type: "string", description: "Port of discharge/destination" },
          origin_country: { type: "string", description: "Country of origin" },
          cargo_description: { type: "string", description: "Description of goods/cargo" },
          hs_code: { type: "string", description: "HS Code(s) if found" },
          weight_kg: { type: "number", description: "Gross weight in KG" },
          net_weight_kg: { type: "number", description: "Net weight in KG" },
          volume_cbm: { type: "number", description: "Volume in CBM" },
          packages: { type: "number", description: "Number of packages" },
          package_type: { type: "string", description: "Type of packages (cartons, pallets, etc.)" },
          invoice_number: { type: "string", description: "Invoice number" },
          invoice_date: { type: "string", description: "Invoice date" },
          invoice_currency: { type: "string", description: "Invoice currency (USD, EUR, GBP, etc.)" },
          fob_value: { type: "number", description: "FOB value" },
          freight_value: { type: "number", description: "Freight charges" },
          insurance_value: { type: "number", description: "Insurance value" },
          cif_value: { type: "number", description: "CIF value (total)" },
          total_amount: { type: "number", description: "Total invoice amount" },
          incoterms: { type: "string", description: "Incoterms (FOB, CIF, EXW, etc.)" },
          shipping_line: { type: "string", description: "Shipping line / carrier name" },
          eta: { type: "string", description: "Expected arrival date (YYYY-MM-DD format if possible)" },
          etd: { type: "string", description: "Expected departure date (YYYY-MM-DD format if possible)" },
          marks_and_numbers: { type: "string", description: "Marks and numbers on packages" },
          supplier_name: { type: "string", description: "Supplier/vendor name from invoice" },
          buyer_name: { type: "string", description: "Buyer name from invoice" },
          line_items: {
            type: "array",
            description: "Individual line items from invoices/packing lists",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity: { type: "number" },
                unit_price: { type: "number" },
                total: { type: "number" },
                hs_code: { type: "string" },
                weight_kg: { type: "number" },
              },
            },
          },
          confidence_notes: {
            type: "string",
            description: "Any notes about extraction confidence, unclear fields, or assumptions made",
          },
        },
        required: ["document_type", "confidence_notes"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { image_base64, image_url, document_hint } = body;

    if (!image_base64 && !image_url) {
      return new Response(JSON.stringify({ error: "Either image_base64 or image_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = image_base64
      ? { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${image_base64}` } }
      : { type: "image_url" as const, image_url: { url: image_url } };

    const hintText = document_hint ? ` The user indicates this is a ${document_hint}.` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a shipping document data extraction specialist for SLAC, a freight forwarding company in Ghana. 
Extract ALL relevant data from the provided shipping document image. Be thorough — extract every field you can identify.
For dates, convert to YYYY-MM-DD format when possible.
For weights, convert to KG. For volumes, convert to CBM.
For currency amounts, extract the numeric value and note the currency.
If a field is unclear or partially visible, extract what you can and note the uncertainty in confidence_notes.${hintText}`,
          },
          {
            role: "user",
            content: [
              { type: "text" as const, text: `Extract all data from this shipping document.${hintText}` },
              imageContent,
            ],
          },
        ],
        tools: EXTRACTION_TOOLS,
        tool_choice: { type: "function", function: { name: "extract_document_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please contact your administrator." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Failed to extract document data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    // Log the interaction
    supabase.from("ai_interactions").insert({
      user_id: user.id,
      department: "operations",
      module: "document_processing",
      prompt: `Document extraction: ${extractedData.document_type || "unknown"}`,
      model: "google/gemini-2.5-flash",
    }).then(() => {}).catch(console.error);

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Document processing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
