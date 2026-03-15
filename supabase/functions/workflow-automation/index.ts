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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // SLA thresholds in hours per stage
    const SLA_CONFIG: Record<string, { maxHours: number; warningHours: number; escalateTo: string; priority: string }> = {
      documents_received: { maxHours: 4, warningHours: 3, escalateTo: "management", priority: "high" },
      documentation_processing: { maxHours: 24, warningHours: 18, escalateTo: "management", priority: "high" },
      customs_declaration: { maxHours: 48, warningHours: 36, escalateTo: "management", priority: "critical" },
      duty_payment: { maxHours: 24, warningHours: 18, escalateTo: "management", priority: "critical" },
      port_processing: { maxHours: 48, warningHours: 36, escalateTo: "management", priority: "high" },
      cargo_release: { maxHours: 24, warningHours: 16, escalateTo: "management", priority: "critical" },
      truck_assignment: { maxHours: 12, warningHours: 8, escalateTo: "operations", priority: "high" },
      delivery_in_transit: { maxHours: 72, warningHours: 48, escalateTo: "operations", priority: "medium" },
    };

    // Fetch all active consignments
    const { data: workflows, error } = await supabase
      .from("consignment_workflows")
      .select("*")
      .neq("current_stage", "delivery_completed");

    if (error) throw error;

    const now = new Date();
    let escalationsCreated = 0;
    let warningsCreated = 0;

    for (const wf of workflows || []) {
      const config = SLA_CONFIG[wf.current_stage];
      if (!config) continue;

      const stageStart = new Date(wf.stage_started_at || wf.created_at);
      const hoursElapsed = (now.getTime() - stageStart.getTime()) / (1000 * 60 * 60);

      // Check if we already sent a notification for this stage
      const { count: existingCount } = await supabase
        .from("workflow_notifications")
        .select("*", { count: "exact", head: true })
        .eq("workflow_id", wf.id)
        .eq("target_department", config.escalateTo)
        .ilike("title", "%SLA%")
        .gte("created_at", stageStart.toISOString());

      if ((existingCount || 0) > 0) continue;

      if (hoursElapsed >= config.maxHours) {
        // SLA BREACHED - Create escalation notification
        await supabase.from("workflow_notifications").insert({
          workflow_id: wf.id,
          consignment_ref: wf.consignment_ref,
          target_department: config.escalateTo,
          title: `⚠️ SLA Breached: ${wf.consignment_ref}`,
          message: `Consignment ${wf.consignment_ref} (${wf.client_name}) has exceeded the ${config.maxHours}h SLA for "${wf.current_stage}" by ${Math.round(hoursElapsed - config.maxHours)}h. Immediate action required.`,
          priority: config.priority,
          action_required: `Escalation: Review and resolve ${wf.current_stage} stage`,
          action_url: `/consignments`,
        });

        // Add timeline event
        await supabase.from("workflow_timeline").insert({
          workflow_id: wf.id,
          event_type: "escalation",
          stage: wf.current_stage,
          title: "SLA Breached - Auto Escalated",
          description: `Stage "${wf.current_stage}" exceeded ${config.maxHours}h SLA. Escalated to ${config.escalateTo}.`,
          performed_by_name: "System Automation",
        });

        escalationsCreated++;
      } else if (hoursElapsed >= config.warningHours) {
        // WARNING - approaching SLA
        const { count: warningCount } = await supabase
          .from("workflow_notifications")
          .select("*", { count: "exact", head: true })
          .eq("workflow_id", wf.id)
          .ilike("title", "%SLA Warning%")
          .gte("created_at", stageStart.toISOString());

        if ((warningCount || 0) === 0) {
          const stageConfig = SLA_CONFIG[wf.current_stage];
          await supabase.from("workflow_notifications").insert({
            workflow_id: wf.id,
            consignment_ref: wf.consignment_ref,
            target_department: wf.current_stage === "duty_payment" ? "accounts" :
              ["customs_declaration", "documentation_processing"].includes(wf.current_stage) ? "documentation" : "operations",
            title: `🕐 SLA Warning: ${wf.consignment_ref}`,
            message: `Consignment ${wf.consignment_ref} (${wf.client_name}) is approaching the ${config.maxHours}h SLA deadline for "${wf.current_stage}". ${Math.round(config.maxHours - hoursElapsed)}h remaining.`,
            priority: "medium",
            action_required: `Complete ${wf.current_stage} before SLA breach`,
            action_url: `/consignments`,
          });
          warningsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: workflows?.length || 0,
        escalationsCreated,
        warningsCreated,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
