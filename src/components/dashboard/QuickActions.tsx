import { Plus, FileText, Truck, Container, Upload, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Plus, label: "New Shipment", color: "bg-accent text-accent-foreground", to: "/shipments?new=1" },
  { icon: FileText, label: "ICUMS Declaration", color: "bg-primary text-primary-foreground", to: "/customs/icums?new=1" },
  { icon: Container, label: "New Consolidation", color: "bg-info text-info-foreground", to: "/consolidation?new=1" },
  { icon: Truck, label: "Assign Truck", color: "bg-success text-success-foreground", to: "/trucking?new=1" },
  { icon: Upload, label: "Upload Document", color: "bg-warning text-warning-foreground", to: "/office-files?upload=1" },
  { icon: Calculator, label: "Generate Invoice", color: "bg-primary text-primary-foreground", to: "/finance/invoices?new=1" },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={() => navigate(action.to)}
            className="h-auto flex-col gap-1.5 md:gap-2 py-3 md:py-4 hover:bg-muted/50 border-border touch-manipulation"
          >
            <div className={`rounded-lg p-2 ${action.color}`}>
              <action.icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-foreground leading-tight text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
