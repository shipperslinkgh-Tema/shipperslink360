import { AlertTriangle, Clock, FileWarning, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "demurrage" | "customs" | "deadline" | "payment";
  title: string;
  description: string;
  time: string;
  priority: "high" | "medium" | "low";
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "demurrage",
    title: "Demurrage Warning - MSKU2345678",
    description: "Free days expire in 2 days. Container at Tema Port.",
    time: "2h ago",
    priority: "high",
  },
  {
    id: "2",
    type: "customs",
    title: "ICUMS Declaration Pending",
    description: "AWB-7890123 awaiting assessment completion.",
    time: "4h ago",
    priority: "medium",
  },
  {
    id: "3",
    type: "deadline",
    title: "DO Expiring Soon",
    description: "Delivery Order for COSU8901234 expires Jan 25.",
    time: "6h ago",
    priority: "medium",
  },
  {
    id: "4",
    type: "payment",
    title: "Outstanding Payment",
    description: "Invoice INV-2026-0234 overdue by 5 days.",
    time: "1d ago",
    priority: "low",
  },
];

const getAlertIcon = (type: Alert["type"]) => {
  switch (type) {
    case "demurrage":
      return <Clock className="h-4 w-4" />;
    case "customs":
      return <FileWarning className="h-4 w-4" />;
    case "deadline":
      return <AlertTriangle className="h-4 w-4" />;
    case "payment":
      return <DollarSign className="h-4 w-4" />;
  }
};

const getPriorityStyles = (priority: Alert["priority"]) => {
  switch (priority) {
    case "high":
      return "border-l-destructive bg-destructive/5";
    case "medium":
      return "border-l-warning bg-warning/5";
    case "low":
      return "border-l-muted-foreground bg-muted/50";
  }
};

const getIconStyles = (priority: Alert["priority"]) => {
  switch (priority) {
    case "high":
      return "text-destructive";
    case "medium":
      return "text-warning";
    case "low":
      return "text-muted-foreground";
  }
};

export function AlertsPanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Active Alerts</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
            {alerts.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "relative flex gap-3 rounded-lg border-l-4 p-3 transition-colors",
              getPriorityStyles(alert.priority)
            )}
          >
            <div className={cn("mt-0.5", getIconStyles(alert.priority))}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{alert.time}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All Alerts
      </Button>
    </div>
  );
}
