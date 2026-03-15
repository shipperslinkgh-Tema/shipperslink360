import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContainerStatus } from "@/hooks/usePortCommandData";
import { WORKFLOW_STAGES } from "@/types/workflow";

interface BottleneckDetectorProps {
  containers: ContainerStatus[];
}

interface Bottleneck {
  stage: string;
  stageLabel: string;
  count: number;
  avgDays: number;
  severity: "low" | "medium" | "high";
  containers: string[];
}

const STAGE_THRESHOLDS: Record<string, number> = {
  documents_received: 2,
  documentation_processing: 3,
  customs_declaration: 3,
  duty_payment: 2,
  port_processing: 3,
  cargo_release: 2,
  truck_assignment: 2,
  delivery_in_transit: 3,
};

export function BottleneckDetector({ containers }: BottleneckDetectorProps) {
  const stageGroups: Record<string, ContainerStatus[]> = {};
  containers.forEach((c) => {
    if (!stageGroups[c.current_stage]) stageGroups[c.current_stage] = [];
    stageGroups[c.current_stage].push(c);
  });

  const bottlenecks: Bottleneck[] = Object.entries(stageGroups)
    .map(([stage, items]) => {
      const avgDays = items.reduce((sum, c) => sum + c.days_in_stage, 0) / items.length;
      const threshold = STAGE_THRESHOLDS[stage] || 3;
      const stageInfo = WORKFLOW_STAGES.find((s) => s.key === stage);

      let severity: Bottleneck["severity"] = "low";
      if (avgDays > threshold * 2) severity = "high";
      else if (avgDays > threshold) severity = "medium";

      return {
        stage,
        stageLabel: stageInfo?.label || stage,
        count: items.length,
        avgDays: Math.round(avgDays * 10) / 10,
        severity,
        containers: items.map((c) => c.container_number || c.consignment_ref),
      };
    })
    .filter((b) => b.severity !== "low" || b.count >= 3)
    .sort((a, b) => {
      const sev = { high: 3, medium: 2, low: 1 };
      return sev[b.severity] - sev[a.severity] || b.count - a.count;
    });

  const severityConfig = {
    high: { badge: "bg-destructive text-destructive-foreground", border: "border-destructive/30" },
    medium: { badge: "bg-amber-500 text-white", border: "border-amber-500/30" },
    low: { badge: "bg-muted text-muted-foreground", border: "" },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Bottleneck Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[360px] overflow-y-auto">
        {bottlenecks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✓ No bottlenecks detected</p>
            <p className="text-xs text-muted-foreground mt-1">All stages flowing normally</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bottlenecks.map((b) => (
              <div key={b.stage} className={cn("rounded-lg border p-2.5 space-y-1.5", severityConfig[b.severity].border)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {b.severity === "high" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    <span className="text-xs font-medium">{b.stageLabel}</span>
                  </div>
                  <Badge className={cn("text-[9px]", severityConfig[b.severity].badge)}>
                    {b.severity.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground">
                  <span>{b.count} consignment{b.count > 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {b.avgDays}d avg
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {b.containers.slice(0, 5).map((ref) => (
                    <span key={ref} className="font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded">
                      {ref}
                    </span>
                  ))}
                  {b.containers.length > 5 && (
                    <span className="text-[9px] text-muted-foreground">+{b.containers.length - 5} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
