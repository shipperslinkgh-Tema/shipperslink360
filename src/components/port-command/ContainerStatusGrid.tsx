import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ship, Plane, Truck, Search, Container } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import type { ContainerStatus } from "@/hooks/usePortCommandData";
import { WORKFLOW_STAGES, STAGE_INDEX } from "@/types/workflow";

interface ContainerStatusGridProps {
  containers: ContainerStatus[];
  onSelect: (id: string) => void;
}

const stageColors: Record<string, string> = {
  documents_received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  documentation_processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  customs_declaration: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  duty_payment: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  port_processing: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  cargo_release: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  truck_assignment: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  delivery_in_transit: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const riskBorder: Record<string, string> = {
  overdue: "border-l-4 border-l-destructive",
  critical: "border-l-4 border-l-orange-500",
  warning: "border-l-4 border-l-amber-400",
  safe: "",
};

export function ContainerStatusGrid({ containers, onSelect }: ContainerStatusGridProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = containers.filter((c) => {
    const matchesSearch = !search || [c.consignment_ref, c.container_number, c.client_name]
      .some((val) => val?.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === "all" || c.current_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Container className="h-4 w-4 text-primary" />
            Container Status Monitor
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">{filtered.length} containers</Badge>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search container, ref, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {WORKFLOW_STAGES.filter(s => s.key !== "delivery_completed").map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No containers found</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors space-y-2",
                  riskBorder[c.demurrage_risk]
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {c.shipment_type === "air" ? (
                      <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : c.shipment_type === "road" ? (
                      <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="font-mono text-xs font-bold text-primary">
                      {c.container_number || c.consignment_ref}
                    </span>
                  </div>
                  {c.is_urgent && <Badge variant="destructive" className="text-[8px] px-1">URG</Badge>}
                </div>

                <Badge className={cn("text-[9px]", stageColors[c.current_stage])}>
                  {WORKFLOW_STAGES[STAGE_INDEX[c.current_stage]]?.label}
                </Badge>

                <div className="text-[10px] space-y-0.5 text-muted-foreground">
                  <p className="truncate">{c.client_name}</p>
                  {c.eta && <p>ETA: {format(new Date(c.eta), "MMM d")}</p>}
                  <div className="flex justify-between">
                    <span>{c.days_in_stage}d in stage</span>
                    {c.free_days_remaining !== null && (
                      <span className={cn(
                        "font-medium",
                        c.demurrage_risk === "overdue" ? "text-destructive" :
                        c.demurrage_risk === "critical" ? "text-orange-500" :
                        c.demurrage_risk === "warning" ? "text-amber-500" :
                        "text-emerald-500"
                      )}>
                        {c.free_days_remaining < 0 ? `${Math.abs(c.free_days_remaining)}d over` : `${c.free_days_remaining}d free`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
