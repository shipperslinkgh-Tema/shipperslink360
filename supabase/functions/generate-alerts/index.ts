import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const alerts: {
      title: string;
      message: string;
      type: string;
      category: string;
      priority: string;
      reference_type?: string;
      reference_id?: string;
      action_url?: string;
      recipient_department?: string;
    }[] = [];

    // 1. Overdue invoices (unpaid past due_date)
    const { data: overdueInvoices } = await supabase
      .from("finance_invoices")
      .select("id, invoice_number, customer, due_date, total_amount, currency")
      .in("status", ["sent", "approved", "draft"])
      .lt("due_date", new Date().toISOString().split("T")[0]);

    for (const inv of overdueInvoices || []) {
      const days = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000);
      alerts.push({
        title: `Invoice ${inv.invoice_number} overdue`,
        message: `${inv.customer} owes ${inv.currency} ${inv.total_amount.toLocaleString()} — ${days} days overdue`,
        type: days >= 30 ? "error" : "warning",
        category: "finance",
        priority: days >= 30 ? "critical" : days >= 7 ? "high" : "medium",
        reference_type: "invoice",
        reference_id: inv.id,
        action_url: "/finance",
        recipient_department: "accounts",
      });
    }

    // 2. Demurrage — containers past free time
    const { data: demurrageRecords } = await supabase
      .from("demurrage_records")
      .select("id, container_number, free_time_end, demurrage_days, total_demurrage, consolidation_id")
      .in("status", ["demurrage", "overdue"])
      .gt("demurrage_days", 0);

    for (const d of demurrageRecords || []) {
      alerts.push({
        title: `Demurrage on ${d.container_number}`,
        message: `${d.demurrage_days} days past free time. Estimated charge: $${(d.total_demurrage || 0).toLocaleString()}`,
        type: "error",
        category: "operations",
        priority: (d.demurrage_days || 0) >= 5 ? "critical" : "high",
        reference_type: "demurrage",
        reference_id: d.id,
        action_url: "/shipping-lines",
        recipient_department: "operations",
      });
    }

    // 3. Free days expiring within 3 days
    const threeDaysOut = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const { data: expiringFree } = await supabase
      .from("demurrage_records")
      .select("id, container_number, free_time_end")
      .eq("status", "within_free")
      .gte("free_time_end", today)
      .lte("free_time_end", threeDaysOut);

    for (const d of expiringFree || []) {
      const daysLeft = Math.ceil((new Date(d.free_time_end).getTime() - Date.now()) / 86400000);
      alerts.push({
        title: `Free days expiring: ${d.container_number}`,
        message: `Only ${daysLeft} day(s) of free time remaining. Act now to avoid demurrage charges.`,
        type: "warning",
        category: "operations",
        priority: daysLeft <= 1 ? "critical" : "high",
        reference_type: "demurrage",
        reference_id: d.id,
        action_url: "/shipping-lines",
        recipient_department: "operations",
      });
    }

    // 4. Stalled consignment workflows (stuck > 48h)
    const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString();
    const { data: stalledWorkflows } = await supabase
      .from("consignment_workflows")
      .select("id, consignment_ref, current_stage, stage_started_at, client_name")
      .not("current_stage", "eq", "delivery_completed")
      .lt("stage_started_at", twoDaysAgo)
      .limit(20);

    for (const w of stalledWorkflows || []) {
      const hrs = Math.floor((Date.now() - new Date(w.stage_started_at).getTime()) / 3600000);
      alerts.push({
        title: `Shipment ${w.consignment_ref} stalled`,
        message: `Stuck at "${w.current_stage}" for ${hrs}h. Client: ${w.client_name}`,
        type: "warning",
        category: "operations",
        priority: hrs >= 96 ? "critical" : "high",
        reference_type: "consignment",
        reference_id: w.id,
        action_url: "/consignments",
        recipient_department: "operations",
      });
    }

    // 5. Registrar renewals expiring within 30 days
    const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const { data: expiringRenewals } = await supabase
      .from("registrar_renewals")
      .select("id, registrar_name, registration_type, expiry_date")
      .eq("status", "active")
      .lte("expiry_date", thirtyDaysOut)
      .gte("expiry_date", today);

    for (const r of expiringRenewals || []) {
      const daysLeft = Math.ceil((new Date(r.expiry_date).getTime() - Date.now()) / 86400000);
      alerts.push({
        title: `${r.registration_type} renewal due`,
        message: `${r.registrar_name} expires in ${daysLeft} days. Renew to avoid penalties.`,
        type: daysLeft <= 7 ? "error" : "warning",
        category: "management",
        priority: daysLeft <= 7 ? "high" : "medium",
        reference_type: "renewal",
        reference_id: r.id,
        action_url: "/settings",
        recipient_department: "management",
      });
    }

    // 6. Large unpaid receivables (> 60 days)
    const { data: agingReceivables } = await supabase
      .from("finance_receivables")
      .select("id, invoice_number, customer, outstanding_amount, currency, days_outstanding")
      .in("status", ["current", "overdue"])
      .gt("outstanding_amount", 0)
      .gt("days_outstanding", 60)
      .limit(10);

    for (const r of agingReceivables || []) {
      alerts.push({
        title: `Aged receivable: ${r.invoice_number}`,
        message: `${r.customer} — ${r.currency} ${(r.outstanding_amount || 0).toLocaleString()} outstanding for ${r.days_outstanding} days`,
        type: "error",
        category: "finance",
        priority: (r.days_outstanding || 0) >= 90 ? "critical" : "high",
        reference_type: "receivable",
        reference_id: r.id,
        action_url: "/finance",
        recipient_department: "accounts",
      });
    }

    // Deduplicate: don't insert if a similar unresolved alert already exists (by title)
    const existingTitles = new Set<string>();
    if (alerts.length > 0) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("title")
        .eq("is_resolved", false)
        .gte("created_at", new Date(Date.now() - 24 * 3600000).toISOString());

      for (const e of existing || []) {
        existingTitles.add(e.title);
      }
    }

    const newAlerts = alerts.filter((a) => !existingTitles.has(a.title));

    if (newAlerts.length > 0) {
      const { error } = await supabase.from("notifications").insert(
        newAlerts.map((a) => ({
          title: a.title,
          message: a.message,
          type: a.type,
          category: a.category,
          priority: a.priority,
          reference_type: a.reference_type || null,
          reference_id: a.reference_id || null,
          action_url: a.action_url || null,
          recipient_department: a.recipient_department || null,
        }))
      );
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ generated: newAlerts.length, skipped: alerts.length - newAlerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-alerts error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
