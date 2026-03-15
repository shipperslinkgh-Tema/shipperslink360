import { cn } from "@/lib/utils";
import { WORKFLOW_STAGES, STAGE_INDEX, type WorkflowStage } from "@/types/workflow";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkflowStageTrackerProps {
  currentStage: WorkflowStage;
  className?: string;
}

export function WorkflowStageTracker({ currentStage, className }: WorkflowStageTrackerProps) {
  const currentIdx = STAGE_INDEX[currentStage];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIdx / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
        />

        {WORKFLOW_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;

          return (
            <Tooltip key={stage.key}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center relative z-10 cursor-default">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "bg-background border-primary text-primary ring-4 ring-primary/20",
                      isFuture && "bg-muted border-muted-foreground/30 text-muted-foreground/50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-1.5 text-center max-w-[70px] leading-tight font-medium",
                      isCompleted && "text-primary",
                      isCurrent && "text-foreground",
                      isFuture && "text-muted-foreground/50"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">Dept: {stage.department}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
