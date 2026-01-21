import { CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShippingLineCardProps {
  name: string;
  logo: string;
  status: "connected" | "syncing" | "error";
  activeDOs: number;
  pendingPayment: number;
  lastSync: string;
}

export function ShippingLineCard({
  name,
  logo,
  status,
  activeDOs,
  pendingPayment,
  lastSync,
}: ShippingLineCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
        );
      case "syncing":
        return (
          <span className="flex items-center gap-1 text-xs text-warning">
            <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" /> Error
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{logo}</span>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            {getStatusBadge()}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xl font-bold text-foreground">{activeDOs}</p>
          <p className="text-xs text-muted-foreground">Active DOs</p>
        </div>
        <div className={cn(
          "rounded-lg p-3 text-center",
          pendingPayment > 0 ? "bg-warning/10" : "bg-muted/50"
        )}>
          <p className={cn(
            "text-xl font-bold",
            pendingPayment > 0 ? "text-warning" : "text-foreground"
          )}>{pendingPayment}</p>
          <p className="text-xs text-muted-foreground">Pending Payment</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last sync: {lastSync}</span>
        <Button variant="link" size="sm" className="h-auto p-0 text-accent">
          View Details →
        </Button>
      </div>
    </div>
  );
}
