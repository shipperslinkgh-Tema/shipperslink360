import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

const variantClasses: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export function DepartmentMetricCard({ title, value, icon, hint, variant = "default" }: Props) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${variantClasses[variant]}`}>{icon}</div>
      </div>
    </Card>
  );
}
