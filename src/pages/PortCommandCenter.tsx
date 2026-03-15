import { useState } from "react";
import { Loader2, Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortCommandData } from "@/hooks/usePortCommandData";
import { PortStatsBar } from "@/components/port-command/PortStatsBar";
import { FreeDaysCountdown } from "@/components/port-command/FreeDaysCountdown";
import { ClearanceTracker } from "@/components/port-command/ClearanceTracker";
import { BottleneckDetector } from "@/components/port-command/BottleneckDetector";
import { ContainerStatusGrid } from "@/components/port-command/ContainerStatusGrid";
import { ConsignmentDetailDialog } from "@/components/workflow/ConsignmentDetailDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function PortCommandCenter() {
  const { data, isLoading } = usePortCommandData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["port-command-data"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { containers = [], stats } = data || { containers: [], stats: { totalActive: 0, atPort: 0, inCustoms: 0, awaitingRelease: 0, inDelivery: 0, urgent: 0, demurrageAtRisk: 0, completedToday: 0 } };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Radio className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Port Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Real-time operations control • Auto-refreshes every 30s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <PortStatsBar stats={stats} />

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <FreeDaysCountdown containers={containers} />
          <BottleneckDetector containers={containers} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <ClearanceTracker containers={containers} />
          <ContainerStatusGrid containers={containers} onSelect={setSelectedId} />
        </div>
      </div>

      <ConsignmentDetailDialog
        workflowId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
