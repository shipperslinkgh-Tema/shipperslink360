import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContainerStatus } from "@/hooks/usePortCommandData";

interface FreeDaysCountdownProps {
  containers: ContainerStatus[];
}

const riskConfig = {
  overdue: { label: "OVERDUE", icon: AlertCircle, badgeClass: "bg-destructive text-destructive-foreground", barClass: "bg-destructive" },
  critical: { label: "CRITICAL", icon: AlertTriangle, badgeClass: "bg-orange-500 text-white", barClass: "bg-orange-500" },
  warning: { label: "WARNING", icon: AlertTriangle, badgeClass: "bg-amber-500 text-white", barClass: "bg-amber-500" },
  safe: { label: "OK", icon: CheckCircle, badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", barClass: "bg-emerald-500" },
};

export function FreeDaysCountdown({ containers }: FreeDaysCountdownProps) {
  const tracked = containers
    .filter((c) => c.free_days !== null && c.free_days_start !== null)
    .sort((a, b) => (a.free_days_remaining ?? 999) - (b.free_days_remaining ?? 999));

  if (tracked.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Free Days Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No containers with free days tracking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Free Days Countdown
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {tracked.length} tracked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 max-h-[360px] overflow-y-auto">
        {tracked.map((c) => {
          const config = riskConfig[c.demurrage_risk];
          const Icon = config.icon;
          const totalDays = c.free_days || 14;
          const used = totalDays - (c.free_days_remaining ?? 0);
          const pct = Math.min(100, Math.max(0, (used / totalDays) * 100));

          return (
            <div key={c.id} className="rounded-lg border p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", c.demurrage_risk === "safe" ? "text-emerald-500" : c.demurrage_risk === "warning" ? "text-amber-500" : "text-destructive")} />
                  <span className="font-mono font-medium truncate">{c.container_number || c.consignment_ref}</span>
                </div>
                <Badge className={cn("text-[9px] px-1.5", config.badgeClass)}>
                  {c.free_days_remaining !== null ? (c.free_days_remaining < 0 ? `${Math.abs(c.free_days_remaining)}d over` : `${c.free_days_remaining}d left`) : "—"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className={cn("h-1.5 rounded-full transition-all", config.barClass)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {c.client_name} • {c.shipping_line || "N/A"}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
