import { Plus, FileText, Truck, Container, Upload, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "New Shipment", color: "bg-accent text-accent-foreground" },
  { icon: FileText, label: "ICUMS Declaration", color: "bg-primary text-primary-foreground" },
  { icon: Container, label: "New Consolidation", color: "bg-info text-info-foreground" },
  { icon: Truck, label: "Assign Truck", color: "bg-success text-success-foreground" },
  { icon: Upload, label: "Upload BL/AWB", color: "bg-warning text-warning-foreground" },
  { icon: Calculator, label: "Generate Invoice", color: "bg-primary text-primary-foreground" },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-muted/50 border-border"
          >
            <div className={`rounded-lg p-2 ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
