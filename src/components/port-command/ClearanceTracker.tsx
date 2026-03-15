import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Ship, Anchor, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContainerStatus } from "@/hooks/usePortCommandData";

interface ClearanceTrackerProps {
  containers: ContainerStatus[];
}

const statusIcon = {
  pending: { icon: Clock, class: "text-muted-foreground" },
  declared: { icon: Clock, class: "text-blue-500" },
  cleared: { icon: CheckCircle2, class: "text-emerald-500" },
  do_issued: { icon: Clock, class: "text-blue-500" },
  released: { icon: CheckCircle2, class: "text-emerald-500" },
  processing: { icon: Clock, class: "text-amber-500" },
};

function StatusDot({ status }: { status: string }) {
  const config = statusIcon[status as keyof typeof statusIcon] || statusIcon.pending;
  const Icon = config.icon;
  return <Icon className={cn("h-3.5 w-3.5", config.class)} />;
}

export function ClearanceTracker({ containers }: ClearanceTrackerProps) {
  const portContainers = containers.filter((c) =>
    ["customs_declaration", "duty_payment", "port_processing", "cargo_release"].includes(c.current_stage)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-primary" />
          Clearance Progress
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {portContainers.length} in clearance
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[360px] overflow-y-auto">
        {portContainers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No containers currently in clearance
          </p>
        ) : (
          <div className="space-y-2">
            {portContainers.map((c) => (
              <div key={c.id} className="rounded-lg border p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-primary">
                    {c.container_number || c.consignment_ref}
                  </span>
                  {c.is_urgent && (
                    <Badge variant="destructive" className="text-[9px]">URGENT</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <StatusDot status={c.clearance_status.icums} />
                    <div>
                      <p className="font-medium">ICUMS</p>
                      <p className="text-muted-foreground capitalize">{c.clearance_status.icums.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <StatusDot status={c.clearance_status.shipping_line} />
                    <div>
                      <p className="font-medium">Shipping Line</p>
                      <p className="text-muted-foreground capitalize">{c.clearance_status.shipping_line.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <StatusDot status={c.clearance_status.gpha} />
                    <div>
                      <p className="font-medium">GPHA</p>
                      <p className="text-muted-foreground capitalize">{c.clearance_status.gpha.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  {c.client_name} • {c.days_in_stage}d in stage
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
