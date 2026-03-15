import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle, Clock, Zap, Timer, TrendingUp,
  ArrowUpRight, Shield, Eye, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useWorkflowSLADashboard, type WorkflowSLAItem } from "@/hooks/useWorkflowAutomation";
import { WORKFLOW_STAGES, STAGE_INDEX } from "@/types/workflow";
import { STAGE_SLA_CONFIG, formatTimeRemaining, type SLAStatus } from "@/lib/workflowAutomation";
import { ConsignmentDetailDialog } from "./ConsignmentDetailDialog";

const slaStatusConfig: Record<SLAStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  on_track: { label: "On Track", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle },
  warning: { label: "Warning", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  breached: { label: "SLA Breached", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle },
};

export function WorkflowAutomationPanel() {
  const { data, isLoading } = useWorkflowSLADashboard();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { items = [], stats = { total: 0, onTrack: 0, warning: 0, breached: 0 } } = data || {};

  const filteredItems = statusFilter === "all"
    ? items
    : items.filter((i) => i.sla.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* SLA Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Active Consignments" value={stats.total} icon={Zap} color="text-primary" />
        <StatsCard title="On Track" value={stats.onTrack} icon={CheckCircle} color="text-emerald-500" />
        <StatsCard title="Warning" value={stats.warning} icon={Clock} color="text-amber-500" />
        <StatsCard title="SLA Breached" value={stats.breached} icon={AlertTriangle} color="text-destructive" />
      </div>

      {/* SLA Thresholds Reference */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Timer className="h-4 w-4" />
            SLA Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STAGE_SLA_CONFIG.map((config) => (
              <div key={config.stage} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5">
                <span className="text-muted-foreground truncate mr-2">{config.label}</span>
                <span className="font-semibold whitespace-nowrap">{config.maxHours}h</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter & List */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              SLA Monitor ({filteredItems.length})
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="breached">Breached</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No consignments in this category</p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <SLARow key={item.workflow.id} item={item} onView={() => setSelectedId(item.workflow.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation Rules Reference */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Escalation Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-1.5">
            {STAGE_SLA_CONFIG.map((config) => (
              <div key={config.stage} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{config.label}</span>
                <div className="flex items-center gap-2">
                  <span>Warning at {config.warningHours}h</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    Escalate → {config.escalateTo}
                  </Badge>
                  <Badge className={cn("text-[10px] px-1.5",
                    config.escalationPriority === "critical" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                    config.escalationPriority === "high" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  )}>
                    {config.escalationPriority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConsignmentDetailDialog
        workflowId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: typeof CheckCircle; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={cn("h-8 w-8 opacity-70", color)} />
        </div>
      </CardContent>
    </Card>
  );
}

function SLARow({ item, onView }: { item: WorkflowSLAItem; onView: () => void }) {
  const { workflow, sla } = item;
  const statusCfg = slaStatusConfig[sla.status];
  const StatusIcon = statusCfg.icon;
  const stageInfo = WORKFLOW_STAGES[STAGE_INDEX[workflow.current_stage]];

  const progressColor =
    sla.status === "breached" ? "bg-destructive" :
    sla.status === "warning" ? "bg-amber-500" :
    "bg-emerald-500";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <StatusIcon className={cn("h-5 w-5 flex-shrink-0",
        sla.status === "breached" ? "text-destructive" :
        sla.status === "warning" ? "text-amber-500" :
        "text-emerald-500"
      )} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold truncate">{workflow.consignment_ref}</span>
          <Badge className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</Badge>
          {workflow.is_urgent && (
            <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">{workflow.client_name}</span>
          <span>•</span>
          <span>{stageInfo?.label}</span>
          <span>•</span>
          <span className={sla.status === "breached" ? "text-destructive font-medium" : ""}>
            {sla.hoursRemaining > 0
              ? `${formatTimeRemaining(sla.hoursRemaining)} left`
              : `${formatTimeRemaining(Math.abs(sla.hoursRemaining))} overdue`}
          </span>
        </div>
        <div className="mt-1.5">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressColor)}
              style={{ width: `${Math.min(100, sla.percentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground">Deadline</p>
        <p className="text-xs font-medium">{format(sla.deadline, "dd MMM HH:mm")}</p>
      </div>

      <Button variant="ghost" size="sm" onClick={onView} className="flex-shrink-0">
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
