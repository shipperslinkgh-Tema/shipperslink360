import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Tables a super admin may purge records from (never auth/roles/ledger internals)
const DELETABLE = new Set([
  "consignment_workflows", "client_shipments", "customers", "trucking_trips", "trucks", "drivers",
  "finance_invoices", "finance_expenses", "finance_payments", "finance_receivables", "finance_payables",
  "finance_job_costs", "vouchers", "notifications", "chat_messages", "consolidations",
  "client_documents", "consignment_documents", "workflow_documents", "shipping_line_documents",
  "accounts_documents", "client_invoices", "client_payments", "trucking_jobs", "media_articles",
  "newsletter_subscribers", "tax_filings", "registrar_renewals", "cargo_receipts", "demurrage_records",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: u, error: ue } = await caller.auth.getUser();
    if (ue || !u?.user) return json({ error: "Unauthorized" }, 401);
    const callerId = u.user.id;

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", callerId);
    if (!roles?.some((r) => r.role === "super_admin")) return json({ error: "Super admin access required" }, 403);

    const body = await req.json();
    const log = (action: string, details: unknown) =>
      admin.from("audit_logs").insert({ user_id: callerId, action, details } as any).then(() => {}, () => {});

    if (body.action === "delete_user") {
      const target = String(body.user_id || "");
      if (!target) return json({ error: "user_id required" }, 400);
      if (target === callerId) return json({ error: "You cannot delete your own account" }, 400);
      await admin.from("user_roles").delete().eq("user_id", target);
      await admin.from("profiles").delete().eq("user_id", target);
      await admin.from("client_profiles").delete().eq("user_id", target);
      const { error } = await admin.auth.admin.deleteUser(target);
      if (error) return json({ error: error.message }, 400);
      await log("super_admin_delete_user", { target });
      return json({ ok: true });
    }

    if (body.action === "delete_records") {
      const table = String(body.table || "");
      const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
      if (!DELETABLE.has(table)) return json({ error: "Table not allowed" }, 400);
      if (!ids.length) return json({ error: "No records selected" }, 400);
      if (table === "consignment_workflows") {
        // Purge the consignment's activity history so it disappears from feeds
        await admin.from("consignment_events").delete().in("consignment_id", ids);
        await admin.from("notifications").delete().eq("reference_type", "consignment").in("reference_id", ids);
      }
      const { error, count } = await admin.from(table).delete({ count: "exact" }).in("id", ids);
      if (error) return json({ error: error.message }, 400);
      await log("super_admin_delete_records", { table, ids });
      return json({ ok: true, deleted: count });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
