import { CheckCircle2, Clock, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShippingLineCardProps {
  name: string;
  logo: string;
  status: "connected" | "syncing" | "error";
  activeDOs: number;
  pendingPayment: number;
  lastSync: string;
  portalUrl?: string;
}

export function ShippingLineCard({
  name,
  logo,
  status,
  activeDOs,
  pendingPayment,
  lastSync,
  portalUrl,
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
    <div className="rounded-lg border border-border bg-card p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{logo}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">{name}</h3>
            {getStatusBadge()}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="rounded-md bg-muted/50 p-2 text-center">
          <p className="text-base font-bold text-foreground">{activeDOs}</p>
          <p className="text-[10px] text-muted-foreground">Active DOs</p>
        </div>
        <div className={cn(
          "rounded-md p-2 text-center",
          pendingPayment > 0 ? "bg-warning/10" : "bg-muted/50"
        )}>
          <p className={cn(
            "text-base font-bold",
            pendingPayment > 0 ? "text-warning" : "text-foreground"
          )}>{pendingPayment}</p>
          <p className="text-[10px] text-muted-foreground">Pending Payment</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Sync: {lastSync}</span>
        <div className="flex items-center gap-1.5">
          {portalUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary text-[10px]"
              onClick={() => window.open(portalUrl, '_blank')}
            >
              <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
              Portal
            </Button>
          )}
          <Button variant="link" size="sm" className="h-auto p-0 text-accent text-[10px]">
            Details →
          </Button>
        </div>
      </div>
    </div>
  );
}
