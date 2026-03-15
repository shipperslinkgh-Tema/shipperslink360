import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO, addDays } from "date-fns";

export interface ContainerStatus {
  id: string;
  consignment_ref: string;
  container_number: string | null;
  client_name: string;
  current_stage: string;
  shipment_type: string;
  eta: string | null;
  vessel_name: string | null;
  terminal: string | null;
  free_days: number | null;
  free_days_start: string | null;
  is_urgent: boolean;
  shipping_line: string | null;
  port_of_discharge: string | null;
  icums_declaration_number: string | null;
  delivery_order_number: string | null;
  cargo_released_at: string | null;
  days_in_stage: number;
  free_days_remaining: number | null;
  demurrage_risk: "safe" | "warning" | "critical" | "overdue";
  clearance_status: {
    icums: "pending" | "declared" | "cleared";
    shipping_line: "pending" | "do_issued" | "released";
    gpha: "pending" | "processing" | "cleared";
  };
}

export interface PortStats {
  totalActive: number;
  atPort: number;
  inCustoms: number;
  awaitingRelease: number;
  inDelivery: number;
  urgent: number;
  demurrageAtRisk: number;
  completedToday: number;
}

function calculateFreeDaysRemaining(freeDays: number | null, freeDaysStart: string | null): number | null {
  if (!freeDays || !freeDaysStart) return null;
  const start = parseISO(freeDaysStart);
  const end = addDays(start, freeDays);
  return differenceInDays(end, new Date());
}

function getDemurrageRisk(remaining: number | null): ContainerStatus["demurrage_risk"] {
  if (remaining === null) return "safe";
  if (remaining < 0) return "overdue";
  if (remaining <= 3) return "critical";
  if (remaining <= 7) return "warning";
  return "safe";
}

function getClearanceStatus(wf: any): ContainerStatus["clearance_status"] {
  return {
    icums: wf.icums_declaration_number
      ? wf.customs_declared_at ? "cleared" : "declared"
      : "pending",
    shipping_line: wf.delivery_order_number
      ? wf.cargo_released_at ? "released" : "do_issued"
      : "pending",
    gpha: wf.port_processing_at
      ? wf.cargo_released_at ? "cleared" : "processing"
      : "pending",
  };
}

export function usePortCommandData() {
  return useQuery({
    queryKey: ["port-command-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignment_workflows")
        .select("*")
        .neq("current_stage", "delivery_completed")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const containers: ContainerStatus[] = (data || []).map((wf) => {
        const freeDaysRemaining = calculateFreeDaysRemaining(wf.free_days, wf.free_days_start);
        const stageStarted = wf.stage_started_at || wf.created_at;
        const daysInStage = differenceInDays(new Date(), parseISO(stageStarted));

        return {
          id: wf.id,
          consignment_ref: wf.consignment_ref,
          container_number: wf.container_number,
          client_name: wf.client_name,
          current_stage: wf.current_stage,
          shipment_type: wf.shipment_type,
          eta: wf.eta,
          vessel_name: wf.vessel_name,
          terminal: wf.terminal,
          free_days: wf.free_days,
          free_days_start: wf.free_days_start,
          is_urgent: wf.is_urgent || false,
          shipping_line: wf.shipping_line,
          port_of_discharge: wf.port_of_discharge,
          icums_declaration_number: wf.icums_declaration_number,
          delivery_order_number: wf.delivery_order_number,
          cargo_released_at: wf.cargo_released_at,
          days_in_stage: daysInStage,
          free_days_remaining: freeDaysRemaining,
          demurrage_risk: getDemurrageRisk(freeDaysRemaining),
          clearance_status: getClearanceStatus(wf),
        };
      });

      const stats: PortStats = {
        totalActive: containers.length,
        atPort: containers.filter((c) =>
          ["port_processing", "cargo_release"].includes(c.current_stage)
        ).length,
        inCustoms: containers.filter((c) =>
          ["customs_declaration", "duty_payment"].includes(c.current_stage)
        ).length,
        awaitingRelease: containers.filter((c) => c.current_stage === "cargo_release").length,
        inDelivery: containers.filter((c) =>
          ["truck_assignment", "delivery_in_transit"].includes(c.current_stage)
        ).length,
        urgent: containers.filter((c) => c.is_urgent).length,
        demurrageAtRisk: containers.filter((c) =>
          ["warning", "critical", "overdue"].includes(c.demurrage_risk)
        ).length,
        completedToday: 0, // Will be calculated separately
      };

      return { containers, stats };
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}
