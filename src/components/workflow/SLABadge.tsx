import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateSLAStatus, formatTimeRemaining, type SLAStatus } from "@/lib/workflowAutomation";
import type { WorkflowStage } from "@/types/workflow";

interface SLABadgeProps {
  stage: WorkflowStage;
  stageStartedAt: string | null;
  createdAt: string;
  compact?: boolean;
}

const statusStyles: Record<SLAStatus, { color: string; icon: typeof CheckCircle }> = {
  on_track: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle },
  warning: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  breached: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse", icon: AlertTriangle },
  completed: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle },
};

export function SLABadge({ stage, stageStartedAt, createdAt, compact }: SLABadgeProps) {
  const sla = calculateSLAStatus(stage, stageStartedAt, createdAt);
  if (!sla) return null;

  const { color, icon: Icon } = statusStyles[sla.status];
  const timeText = sla.hoursRemaining > 0
    ? `${formatTimeRemaining(sla.hoursRemaining)} left`
    : `${formatTimeRemaining(Math.abs(sla.hoursRemaining))} overdue`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={cn("gap-1 cursor-default", color, compact && "text-[10px] px-1.5")}>
          <Icon className={cn("h-3 w-3", compact && "h-2.5 w-2.5")} />
          {timeText}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <p className="font-semibold">SLA: {sla.slaConfig.maxHours}h limit</p>
          <p>Elapsed: {Math.round(sla.hoursElapsed)}h</p>
          <p>Deadline: {format(sla.deadline, "dd MMM yyyy HH:mm")}</p>
          {sla.status === "breached" && (
            <p className="text-destructive font-medium">
              Escalates to: {sla.slaConfig.escalateTo}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
