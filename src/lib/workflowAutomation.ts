import { differenceInHours, differenceInDays, parseISO, addHours } from "date-fns";
import type { WorkflowStage } from "@/types/workflow";

// ── SLA Configuration per Stage ────────────────────────────────
export interface StageSLA {
  stage: WorkflowStage;
  label: string;
  department: string;
  maxHours: number; // SLA deadline in hours
  warningHours: number; // Warning threshold before deadline
  escalateTo: string; // Department to escalate to
  escalationPriority: "medium" | "high" | "critical";
  autoAssignDepartment: string;
}

export const STAGE_SLA_CONFIG: StageSLA[] = [
  {
    stage: "documents_received",
    label: "Documents Received",
    department: "management",
    maxHours: 4,
    warningHours: 3,
    escalateTo: "management",
    escalationPriority: "high",
    autoAssignDepartment: "documentation",
  },
  {
    stage: "documentation_processing",
    label: "Documentation Processing",
    department: "documentation",
    maxHours: 24,
    warningHours: 18,
    escalateTo: "management",
    escalationPriority: "high",
    autoAssignDepartment: "documentation",
  },
  {
    stage: "customs_declaration",
    label: "Customs Declaration",
    department: "documentation",
    maxHours: 48,
    warningHours: 36,
    escalateTo: "management",
    escalationPriority: "critical",
    autoAssignDepartment: "documentation",
  },
  {
    stage: "duty_payment",
    label: "Duty Payment",
    department: "accounts",
    maxHours: 24,
    warningHours: 18,
    escalateTo: "management",
    escalationPriority: "critical",
    autoAssignDepartment: "accounts",
  },
  {
    stage: "port_processing",
    label: "Port Processing",
    department: "operations",
    maxHours: 48,
    warningHours: 36,
    escalateTo: "management",
    escalationPriority: "high",
    autoAssignDepartment: "operations",
  },
  {
    stage: "cargo_release",
    label: "Cargo Release",
    department: "operations",
    maxHours: 24,
    warningHours: 16,
    escalateTo: "management",
    escalationPriority: "critical",
    autoAssignDepartment: "operations",
  },
  {
    stage: "truck_assignment",
    label: "Truck Assignment",
    department: "warehouse",
    maxHours: 12,
    warningHours: 8,
    escalateTo: "operations",
    escalationPriority: "high",
    autoAssignDepartment: "warehouse",
  },
  {
    stage: "delivery_in_transit",
    label: "Delivery In Transit",
    department: "warehouse",
    maxHours: 72,
    warningHours: 48,
    escalateTo: "operations",
    escalationPriority: "medium",
    autoAssignDepartment: "warehouse",
  },
];

// ── SLA Status Types ────────────────────────────────────────────
export type SLAStatus = "on_track" | "warning" | "breached" | "completed";

export interface SLAInfo {
  status: SLAStatus;
  hoursElapsed: number;
  hoursRemaining: number;
  percentUsed: number;
  deadline: Date;
  slaConfig: StageSLA;
}

// ── Calculate SLA Status ────────────────────────────────────────
export function calculateSLAStatus(
  stage: WorkflowStage,
  stageStartedAt: string | null,
  createdAt: string
): SLAInfo | null {
  if (stage === "delivery_completed") return null;

  const config = STAGE_SLA_CONFIG.find((s) => s.stage === stage);
  if (!config) return null;

  const startTime = parseISO(stageStartedAt || createdAt);
  const now = new Date();
  const hoursElapsed = differenceInHours(now, startTime);
  const hoursRemaining = Math.max(0, config.maxHours - hoursElapsed);
  const percentUsed = Math.min(100, (hoursElapsed / config.maxHours) * 100);
  const deadline = addHours(startTime, config.maxHours);

  let status: SLAStatus = "on_track";
  if (hoursElapsed >= config.maxHours) {
    status = "breached";
  } else if (hoursElapsed >= config.warningHours) {
    status = "warning";
  }

  return {
    status,
    hoursElapsed,
    hoursRemaining,
    percentUsed,
    deadline,
    slaConfig: config,
  };
}

// ── Format Time Remaining ───────────────────────────────────────
export function formatTimeRemaining(hours: number): string {
  if (hours <= 0) return "Overdue";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

// ── Escalation Message Templates ────────────────────────────────
export function getEscalationMessage(
  consignmentRef: string,
  clientName: string,
  stage: WorkflowStage,
  hoursOverdue: number
): { title: string; message: string } {
  const config = STAGE_SLA_CONFIG.find((s) => s.stage === stage);
  const stageLabel = config?.label || stage;

  return {
    title: `⚠️ SLA Breached: ${consignmentRef}`,
    message: `Consignment ${consignmentRef} (${clientName}) has exceeded the ${config?.maxHours}h SLA for "${stageLabel}" by ${Math.round(hoursOverdue)}h. Immediate action required.`,
  };
}

// ── Auto-assignment Rules ───────────────────────────────────────
export function getAutoAssignDepartment(stage: WorkflowStage): string | null {
  const config = STAGE_SLA_CONFIG.find((s) => s.stage === stage);
  return config?.autoAssignDepartment || null;
}
