import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = "default",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getIconBg = () => {
    switch (variant) {
      case "accent":
        return "bg-accent/10 text-accent";
      case "success":
        return "bg-success/10 text-success";
      case "warning":
        return "bg-warning/10 text-warning";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="metric-card group hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn("mt-2 flex items-center gap-1 text-sm", getTrendColor())}>
              {getTrendIcon()}
              <span className="font-medium">{Math.abs(change)}%</span>
              {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", getIconBg())}>{icon}</div>
      </div>
    </div>
  );
}
