import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateSLAStatus, type SLAInfo, type SLAStatus } from "@/lib/workflowAutomation";
import type { ConsignmentWorkflow, WorkflowStage } from "@/types/workflow";

export interface WorkflowSLAItem {
  workflow: ConsignmentWorkflow;
  sla: SLAInfo;
}

export function useWorkflowSLADashboard() {
  return useQuery({
    queryKey: ["workflow-sla-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignment_workflows")
        .select("*")
        .neq("current_stage", "delivery_completed")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const workflows = data as unknown as ConsignmentWorkflow[];
      const items: WorkflowSLAItem[] = [];

      for (const wf of workflows) {
        const sla = calculateSLAStatus(
          wf.current_stage as WorkflowStage,
          wf.stage_started_at,
          wf.created_at
        );
        if (sla) {
          items.push({ workflow: wf, sla });
        }
      }

      // Sort: breached first, then warning, then on_track
      const priority: Record<SLAStatus, number> = {
        breached: 0,
        warning: 1,
        on_track: 2,
        completed: 3,
      };
      items.sort((a, b) => priority[a.sla.status] - priority[b.sla.status]);

      const stats = {
        total: items.length,
        onTrack: items.filter((i) => i.sla.status === "on_track").length,
        warning: items.filter((i) => i.sla.status === "warning").length,
        breached: items.filter((i) => i.sla.status === "breached").length,
      };

      return { items, stats };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
