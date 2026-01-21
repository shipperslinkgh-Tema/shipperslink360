import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Integration {
  name: string;
  status: "connected" | "pending" | "error";
  lastSync?: string;
  details?: string;
}

interface IntegrationStatusCardProps {
  integrations: Integration[];
}

export function IntegrationStatusCard({ integrations }: IntegrationStatusCardProps) {
  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "pending":
        return "Syncing";
      case "error":
        return "Error";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">System Integrations</h3>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
          View All <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(integration.status)}
              <div>
                <p className="text-sm font-medium text-foreground">{integration.name}</p>
                {integration.details && (
                  <p className="text-xs text-muted-foreground">{integration.details}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  integration.status === "connected" && "bg-success/10 text-success",
                  integration.status === "pending" && "bg-warning/10 text-warning",
                  integration.status === "error" && "bg-destructive/10 text-destructive"
                )}
              >
                {getStatusLabel(integration.status)}
              </span>
              {integration.lastSync && (
                <p className="text-xs text-muted-foreground mt-1">{integration.lastSync}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
