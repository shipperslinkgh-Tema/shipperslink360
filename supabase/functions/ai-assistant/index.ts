import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Tool Definitions ────────────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "query_consignments",
      description: "Search and retrieve consignment workflow data. Use for shipment status, customs stage, ETAs, container info, duty amounts, and client shipments.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter by current_stage: documents_received, documentation, customs_declaration, duty_payment, port_processing, container_release, truck_assignment, delivery_in_transit, delivery_completed" },
          client_name: { type: "string", description: "Filter by client name (partial match)" },
          bl_number: { type: "string", description: "Filter by BL number" },
          container_number: { type: "string", description: "Filter by container number" },
          is_urgent: { type: "boolean", description: "Filter urgent shipments only" },
          limit: { type: "number", description: "Max rows to return (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_invoices",
      description: "Search finance invoices. Use for outstanding balances, overdue invoices, revenue analysis, payment status.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: draft, pending, approved, paid, overdue, cancelled" },
          customer: { type: "string", description: "Customer name (partial match)" },
          currency: { type: "string", description: "GHS, USD, EUR, GBP" },
          date_from: { type: "string", description: "Issue date from (YYYY-MM-DD)" },
          date_to: { type: "string", description: "Issue date to (YYYY-MM-DD)" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_consolidations",
      description: "Search consolidation shipments (LCL/Air). Use for container status, ETAs, shipper counts, vessel/flight info.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: planning, loading, in_transit, arrived, clearing, completed" },
          type: { type: "string", description: "LCL or Air" },
          consolidation_ref: { type: "string", description: "Reference number" },
          destination: { type: "string", description: "Destination filter" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_trucking_trips",
      description: "Search trucking trips. Use for delivery status, driver info, fleet monitoring, trip costs.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: scheduled, at_pickup, in_transit, delivered, completed" },
          customer: { type: "string", description: "Customer name" },
          driver_name: { type: "string", description: "Driver name" },
          container_number: { type: "string", description: "Container number" },
          date_from: { type: "string", description: "Pickup date from" },
          date_to: { type: "string", description: "Pickup date to" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_demurrage",
      description: "Check demurrage and storage charges. Use for containers at risk, free time expiry, cost analysis.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: within_free, warning, accruing, critical" },
          container_number: { type: "string", description: "Container number" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_customers",
      description: "Search customer/client records. Use for client info, outstanding balances, shipment counts, contact details.",
      parameters: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Company name (partial match)" },
          status: { type: "string", description: "active or inactive" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_expenses",
      description: "Search company expenses. Use for expense analysis, approval status, category breakdown.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "pending, approved, paid, rejected" },
          category: { type: "string", description: "Expense category" },
          date_from: { type: "string", description: "From date" },
          date_to: { type: "string", description: "To date" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_receivables",
      description: "Search accounts receivable. Use for aging analysis, outstanding amounts, collection status.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "current, overdue, critical, written_off" },
          aging_bucket: { type: "string", description: "current, 30_days, 60_days, 90_days, over_90" },
          customer: { type: "string", description: "Customer name" },
          limit: { type: "number", description: "Max rows (default 20)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_stats",
      description: "Get summary statistics across the platform — counts of active shipments, pending invoices, fleet status, etc. Use when user asks for overviews or summaries.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_document_text",
      description: "Generate logistics document text: quotations, cargo status reports, delivery reports, customs checklists, client update emails, shipment summaries.",
      parameters: {
        type: "object",
        properties: {
          document_type: { type: "string", enum: ["quotation", "cargo_status_report", "delivery_report", "customs_checklist", "client_email", "shipment_summary", "invoice_reminder", "executive_summary"], description: "Type of document to generate" },
          context: { type: "string", description: "Relevant context or data to include in the document" },
          client_name: { type: "string", description: "Client name if applicable" },
          reference: { type: "string", description: "BL, AWB, or consignment reference if applicable" },
        },
        required: ["document_type"],
        additionalProperties: false,
      },
    },
  },
];

// ── System Prompt (universal, department-enhanced) ──────────────────
function buildSystemPrompt(department: string, userName: string): string {
  const today = new Date().toISOString().split("T")[0];
  
  const departmentContext: Record<string, string> = {
    operations: `\n\nYou are primarily supporting the OPERATIONS team. Prioritize: shipment tracking, container status, ETAs, vessel schedules, customs clearance timelines, and delivery coordination. Use query_consignments, query_consolidations, and query_trucking_trips tools proactively.`,
    documentation: `\n\nYou are primarily supporting the DOCUMENTATION team. Prioritize: HS code classification (Ghana GRA tariff), customs document validation, BL/AWB verification, ICUMS filing guidance, certificates of origin, and import permit requirements.`,
    accounts: `\n\nYou are primarily supporting the ACCOUNTS & FINANCE team. Prioritize: invoice status, outstanding payments, receivables aging, expense analysis, forex calculations (GHS/USD/EUR), VAT/NHIL/GETFund computations, and cash flow summaries. Use query_invoices, query_expenses, and query_receivables tools proactively.`,
    management: `\n\nYou are primarily supporting MANAGEMENT. Prioritize: executive KPIs, shipment volumes, revenue trends, department performance, risk indicators, demurrage exposure, and high-level business summaries. Use get_dashboard_stats and generate_document_text for reports.`,
    warehouse: `\n\nYou are primarily supporting the WAREHOUSE team. Prioritize: cargo receiving/tallying, warehouse location management, consolidation stuffing, inventory tracking, cargo condition, dispatch coordination, and storage charge monitoring.`,
    customer_service: `\n\nYou are primarily supporting CUSTOMER SERVICE. Prioritize: client communications, shipment status updates, issue resolution, client portal guidance, invoice inquiries, and relationship management.`,
  };

  return `You are **SLAC AI** — the intelligent operations assistant for **Shippers Link Agencies Co., Ltd (SLAC)**, a freight forwarding and customs clearing company based in Accra, Ghana, operating primarily at Tema and Takoradi ports.

**Today's date:** ${today}
**Current user:** ${userName}
**User's department:** ${department}

## YOUR CAPABILITIES

You are a central intelligence engine with access to real-time company data through tools. You can:

1. **Query Live Data** — Search consignments, invoices, consolidations, trucking trips, demurrage records, customers, expenses, and receivables using your tools. ALWAYS use tools when users ask about specific data.

2. **Analyze Operations** — Calculate clearance times, container dwell time, delivery performance, demurrage risk, revenue trends, and client profitability from queried data.

3. **Generate Documents** — Create quotations, cargo status reports, delivery reports, customs checklists, client update emails, invoice reminders, and executive summaries using the generate_document_text tool.

4. **Provide Knowledge** — Answer questions about Ghana import procedures, customs documentation, HS code classification, ICUMS processes, shipping terminology, GRA regulatory guidelines, port operations at Tema/Takoradi, and freight industry best practices.

5. **Decision Support** — Identify shipments at demurrage risk, flag overdue invoices, detect documentation delays, suggest optimal delivery schedules, and recommend workflow improvements.

## GHANA LOGISTICS KNOWLEDGE BASE

### Import Procedures
- Pre-arrival: IDF (Import Declaration Form) via ICUMS, advance manifest submission
- Arrival: Vessel berthing → Manifest processing → Container offloading → CFS/Terminal storage
- Clearance: Customs declaration (SAD) → Assessment → Duty payment → Release → Delivery
- Key bodies: GRA Customs, GPHA, FDA, GSA, EPA (depending on cargo type)

### Customs Documentation Requirements
- Bill of Lading / Airway Bill (original)
- Commercial Invoice (3 copies)
- Packing List
- Certificate of Origin (Form A or EUR.1)
- IDF (Import Declaration Form)
- CCVR (Customs Classification & Valuation Report)
- Insurance Certificate
- Import Permit (for restricted goods)
- SONCAP/SOB certificates (standards compliance)
- Phytosanitary certificate (for agricultural products)

### Duty & Tax Structure (Ghana)
- Import Duty: 0-35% (varies by HS code)
- VAT: 15%
- NHIL: 2.5%
- GETFund Levy: 2.5%
- ECOWAS Levy: 0.5%
- AU Levy: 0.2%
- EXIM Levy: 0.75%
- Processing Fee: 1%
- Special Import Levy: 2% (on selected items)

### Shipping Terminology
- BL: Bill of Lading | AWB: Air Waybill | DO: Delivery Order
- FCL: Full Container Load | LCL: Less than Container Load
- CFS: Container Freight Station | CIF: Cost, Insurance & Freight
- FOB: Free on Board | ETD/ETA: Estimated Time of Departure/Arrival
- TEU: Twenty-foot Equivalent Unit | CBM: Cubic Meter
- Demurrage: Charges for container held beyond free time at terminal
- Detention: Charges for container held beyond free time outside terminal

## INTERACTION GUIDELINES

1. **Always use tools first** when users ask about data. Don't guess — query the database.
2. **Format responses clearly** with markdown: tables, bullet points, bold for key figures.
3. **Be proactive** — if a user asks about a shipment, also mention if it's at demurrage risk.
4. **Remember context** — use the full conversation history to understand references like "the first one" or "that client."
5. **Provide actionable insights** — don't just show data, interpret it and suggest next steps.
6. **Use monetary formatting** — GHS 1,234.56 or USD 5,678.90 with currency symbols.
7. **Be concise but thorough** — executive summaries for management, detailed for operations.
${departmentContext[department] || departmentContext.default || ""}`;
}

// ── Tool Execution ──────────────────────────────────────────────────
async function executeTool(supabase: any, toolName: string, args: any): Promise<string> {
  const limit = args.limit || 20;

  try {
    switch (toolName) {
      case "query_consignments": {
        let query = supabase.from("consignment_workflows").select("consignment_ref, client_name, current_stage, shipment_type, bl_number, awb_number, container_number, eta, duty_amount, is_urgent, vessel_name, origin_country, port_of_discharge, assigned_officer, created_at, stage_started_at").order("created_at", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("current_stage", args.status);
        if (args.client_name) query = query.ilike("client_name", `%${args.client_name}%`);
        if (args.bl_number) query = query.ilike("bl_number", `%${args.bl_number}%`);
        if (args.container_number) query = query.ilike("container_number", `%${args.container_number}%`);
        if (args.is_urgent) query = query.eq("is_urgent", true);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        return JSON.stringify({ count: data?.length || 0, results: data || [] });
      }

      case "query_invoices": {
        let query = supabase.from("finance_invoices").select("invoice_number, customer, total_amount, paid_amount, currency, status, issue_date, due_date, service_type, consolidation_ref, job_ref").order("issue_date", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.customer) query = query.ilike("customer", `%${args.customer}%`);
        if (args.currency) query = query.eq("currency", args.currency);
        if (args.date_from) query = query.gte("issue_date", args.date_from);
        if (args.date_to) query = query.lte("issue_date", args.date_to);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        const totalAmount = data?.reduce((s: number, i: any) => s + (i.total_amount || 0), 0) || 0;
        const totalPaid = data?.reduce((s: number, i: any) => s + (i.paid_amount || 0), 0) || 0;
        return JSON.stringify({ count: data?.length || 0, total_amount: totalAmount, total_paid: totalPaid, outstanding: totalAmount - totalPaid, results: data || [] });
      }

      case "query_consolidations": {
        let query = supabase.from("consolidations").select("consolidation_ref, type, status, origin, destination, vessel, voyage, flight, carrier, eta, etd, container_number, total_cbm, total_weight, total_packages, shippers_count").order("created_at", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.type) query = query.eq("type", args.type);
        if (args.consolidation_ref) query = query.ilike("consolidation_ref", `%${args.consolidation_ref}%`);
        if (args.destination) query = query.ilike("destination", `%${args.destination}%`);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        return JSON.stringify({ count: data?.length || 0, results: data || [] });
      }

      case "query_trucking_trips": {
        let query = supabase.from("trucking_trips").select("id, customer, driver_name, truck_number, origin, destination, status, pickup_date, delivery_date, trip_cost, fuel_cost, container_number, bl_number, tracking_active").order("created_at", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.customer) query = query.ilike("customer", `%${args.customer}%`);
        if (args.driver_name) query = query.ilike("driver_name", `%${args.driver_name}%`);
        if (args.container_number) query = query.ilike("container_number", `%${args.container_number}%`);
        if (args.date_from) query = query.gte("pickup_date", args.date_from);
        if (args.date_to) query = query.lte("pickup_date", args.date_to);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        return JSON.stringify({ count: data?.length || 0, results: data || [] });
      }

      case "query_demurrage": {
        let query = supabase.from("demurrage_records").select("container_number, status, free_time_start, free_time_end, free_time_days, current_days, demurrage_days, daily_rate, total_demurrage, storage_days, total_storage").order("created_at", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.container_number) query = query.ilike("container_number", `%${args.container_number}%`);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        const totalDemurrage = data?.reduce((s: number, r: any) => s + (r.total_demurrage || 0), 0) || 0;
        return JSON.stringify({ count: data?.length || 0, total_demurrage_charges: totalDemurrage, results: data || [] });
      }

      case "query_customers": {
        let query = supabase.from("customers").select("company_name, trade_name, email, phone, city, country, industry, status, total_shipments, outstanding_balance, credit_limit, credit_status").order("company_name").limit(limit);
        if (args.company_name) query = query.ilike("company_name", `%${args.company_name}%`);
        if (args.status) query = query.eq("status", args.status);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        return JSON.stringify({ count: data?.length || 0, results: data || [] });
      }

      case "query_expenses": {
        let query = supabase.from("finance_expenses").select("expense_ref, category, description, amount, currency, status, expense_date, requested_by, approved_by, ghs_equivalent").order("expense_date", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.category) query = query.ilike("category", `%${args.category}%`);
        if (args.date_from) query = query.gte("expense_date", args.date_from);
        if (args.date_to) query = query.lte("expense_date", args.date_to);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        const total = data?.reduce((s: number, e: any) => s + (e.ghs_equivalent || 0), 0) || 0;
        return JSON.stringify({ count: data?.length || 0, total_ghs: total, results: data || [] });
      }

      case "query_receivables": {
        let query = supabase.from("finance_receivables").select("invoice_number, customer, original_amount, paid_amount, outstanding_amount, currency, status, aging_bucket, days_outstanding, due_date, credit_status").order("days_outstanding", { ascending: false }).limit(limit);
        if (args.status) query = query.eq("status", args.status);
        if (args.aging_bucket) query = query.eq("aging_bucket", args.aging_bucket);
        if (args.customer) query = query.ilike("customer", `%${args.customer}%`);
        const { data, error } = await query;
        if (error) return `Error: ${error.message}`;
        const totalOutstanding = data?.reduce((s: number, r: any) => s + (r.outstanding_amount || 0), 0) || 0;
        return JSON.stringify({ count: data?.length || 0, total_outstanding: totalOutstanding, results: data || [] });
      }

      case "get_dashboard_stats": {
        const [consignments, invoices, trips, demurrage, consolidations] = await Promise.all([
          supabase.from("consignment_workflows").select("current_stage", { count: "exact" }),
          supabase.from("finance_invoices").select("status, total_amount, paid_amount"),
          supabase.from("trucking_trips").select("status", { count: "exact" }),
          supabase.from("demurrage_records").select("status, total_demurrage"),
          supabase.from("consolidations").select("status", { count: "exact" }),
        ]);

        const stageCounts: Record<string, number> = {};
        consignments.data?.forEach((c: any) => { stageCounts[c.current_stage] = (stageCounts[c.current_stage] || 0) + 1; });

        const invoiceStats = {
          total: invoices.data?.length || 0,
          total_revenue: invoices.data?.reduce((s: number, i: any) => s + (i.total_amount || 0), 0) || 0,
          total_collected: invoices.data?.reduce((s: number, i: any) => s + (i.paid_amount || 0), 0) || 0,
          by_status: {} as Record<string, number>,
        };
        invoices.data?.forEach((i: any) => { invoiceStats.by_status[i.status] = (invoiceStats.by_status[i.status] || 0) + 1; });

        const tripStats: Record<string, number> = {};
        trips.data?.forEach((t: any) => { tripStats[t.status] = (tripStats[t.status] || 0) + 1; });

        const demurrageTotal = demurrage.data?.reduce((s: number, d: any) => s + (d.total_demurrage || 0), 0) || 0;
        const atRisk = demurrage.data?.filter((d: any) => d.status === "warning" || d.status === "accruing" || d.status === "critical").length || 0;

        return JSON.stringify({
          consignments: { total: consignments.count || 0, by_stage: stageCounts },
          invoices: invoiceStats,
          trucking: { total: trips.count || 0, by_status: tripStats },
          demurrage: { total_charges: demurrageTotal, at_risk_containers: atRisk },
          consolidations: { total: consolidations.count || 0 },
        });
      }

      case "generate_document_text": {
        // This tool returns a structured prompt for the AI to generate the document inline
        return JSON.stringify({
          instruction: `Generate a professional ${args.document_type.replace(/_/g, " ")} document for SLAC (Shippers Link Agencies Co., Ltd).`,
          context: args.context || "No additional context provided",
          client: args.client_name || "Not specified",
          reference: args.reference || "Not specified",
          format_guidelines: "Use professional formatting with proper headers, date, reference numbers. Include SLAC company details where appropriate.",
        });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (e) {
    return JSON.stringify({ error: `Tool execution failed: ${e instanceof Error ? e.message : "Unknown"}` });
  }
}

// ── Main Handler ────────────────────────────────────────────────────
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Use service role for tool queries (bypasses RLS for data access)
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("department, full_name")
      .eq("user_id", user.id)
      .single();

    const department = profile?.department || "default";
    const userName = profile?.full_name || "Staff";

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

    const systemPrompt = buildSystemPrompt(department, userName);
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";

    // ── First call: may trigger tool calls ──────────────────────
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools: TOOLS,
        stream: false, // Non-streaming first to handle tool calls
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please contact your administrator." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await firstResponse.text();
      console.error("AI gateway error:", firstResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstResult = await firstResponse.json();
    const firstChoice = firstResult.choices?.[0];

    // Check if the model wants to call tools
    if (firstChoice?.finish_reason === "tool_calls" || firstChoice?.message?.tool_calls?.length > 0) {
      const toolCalls = firstChoice.message.tool_calls;
      
      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        toolCalls.map(async (tc: any) => {
          const args = typeof tc.function.arguments === "string" 
            ? JSON.parse(tc.function.arguments) 
            : tc.function.arguments;
          const result = await executeTool(serviceClient, tc.function.name, args);
          return {
            role: "tool",
            tool_call_id: tc.id,
            content: result,
          };
        })
      );

      // Second call with tool results — this time streaming
      const secondMessages = [
        ...aiMessages,
        firstChoice.message,
        ...toolResults,
      ];

      const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: secondMessages,
          stream: true,
        }),
      });

      if (!secondResponse.ok) {
        const errText = await secondResponse.text();
        console.error("AI second call error:", secondResponse.status, errText);
        return new Response(JSON.stringify({ error: "AI service unavailable" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log interaction
      serviceClient.from("ai_interactions").insert({
        user_id: user.id,
        department,
        module,
        prompt: lastUserMessage.slice(0, 2000),
        model: "google/gemini-3-flash-preview",
      }).then(() => {}).catch(console.error);

      return new Response(secondResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls — stream directly
    // Re-do the call with streaming since first was non-streaming
    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools: TOOLS,
        stream: true,
      }),
    });

    if (!streamResponse.ok) {
      const errText = await streamResponse.text();
      console.error("AI stream error:", streamResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log interaction
    serviceClient.from("ai_interactions").insert({
      user_id: user.id,
      department,
      module,
      prompt: lastUserMessage.slice(0, 2000),
      model: "google/gemini-3-flash-preview",
    }).then(() => {}).catch(console.error);

    return new Response(streamResponse.body, {
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
