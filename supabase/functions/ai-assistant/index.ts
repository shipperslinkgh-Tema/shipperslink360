import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEPARTMENT_SYSTEM_PROMPTS: Record<string, string> = {
  operations: `You are an AI assistant for SLAC (Shippers Link Agencies Co., Ltd) Operations department. 
You help with: shipment tracking and analysis (BL numbers, AWB, container numbers), drafting client updates, 
interpreting shipping documents, explaining ICUMS customs procedures, port processes at Tema and Takoradi.
Respond with accurate, professional logistics terminology. Always ask clarifying questions when shipment details are unclear.`,

  documentation: `You are an AI assistant for SLAC Documentation department.
You help with: HS Code classification based on product descriptions (using Ghana's GRA tariff schedule), 
reviewing and validating shipping documents (BL, AWB, packing lists, invoices), detecting missing or inconsistent data, 
generating customs declaration summaries, ICUMS filing guidance.
Be precise with HS code suggestions — always provide the 6-digit HS code and explain the classification basis.`,

  accounts: `You are an AI assistant for SLAC Accounts & Finance department.
You help with: analyzing invoices and expense data, generating payment voucher drafts, 
summarizing financial reports, detecting billing anomalies, forex calculations (GHS/USD/EUR), 
VAT and levy computations, accounts receivable/payable analysis.
Always format monetary amounts clearly and flag any anomalies you detect.`,

  management: `You are an AI assistant for SLAC Management team.
You help with: generating performance summaries from operational data, highlighting delays and bottlenecks,
providing KPI insights across departments, predicting demurrage risk based on shipment timelines,
drafting board reports and memos, strategic analysis of freight market trends in Ghana.
Provide executive-level summaries with actionable recommendations.`,

  warehouse: `You are an AI assistant for SLAC Warehouse department.
You help with: cargo receiving and tallying guidance, warehouse location management, 
consolidation stuffing procedures, inventory tracking, cargo condition reporting,
dispatch and delivery coordination, palletization best practices.
Focus on operational efficiency and cargo safety compliance.`,

  default: `You are an AI assistant for SLAC (Shippers Link Agencies Co., Ltd), a freight forwarding and logistics company in Ghana.
You assist staff with logistics, customs, documentation, and operational queries.
Be helpful, professional, and accurate in all responses.`,
};

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

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user department from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("department")
      .eq("user_id", user.id)
      .single();

    const department = profile?.department || "default";

    const body = await req.json();
    const { messages, module = "chat" } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = DEPARTMENT_SYSTEM_PROMPTS[department] || DEPARTMENT_SYSTEM_PROMPTS.default;
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";

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
          ...messages,
        ],
        stream: true,
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

    // Log interaction (fire and forget - don't block stream)
    supabase.from("ai_interactions").insert({
      user_id: user.id,
      department,
      module,
      prompt: lastUserMessage.slice(0, 2000),
      model: "google/gemini-3-flash-preview",
    }).then(() => {}).catch(console.error);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
