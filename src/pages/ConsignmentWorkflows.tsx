import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Search, Package, FileText, Ship, Plane, Truck, Clock,
  AlertTriangle, CheckCircle, ArrowRight, Eye, Loader2, Zap,
  Download, Upload, MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useConsignmentWorkflows } from "@/hooks/useConsignmentWorkflow";
import { WORKFLOW_STAGES, STAGE_INDEX, type WorkflowStage, type ConsignmentWorkflow } from "@/types/workflow";
import { WorkflowStageTracker } from "@/components/workflow/WorkflowStageTracker";
import { NewConsignmentDialog } from "@/components/workflow/NewConsignmentDialog";
import { ConsignmentDetailDialog } from "@/components/workflow/ConsignmentDetailDialog";
import { WorkflowAutomationPanel } from "@/components/workflow/WorkflowAutomationPanel";
import { SLABadge } from "@/components/workflow/SLABadge";
import { CSVImportDialog } from "@/components/shared/CSVImportDialog";
import { exportToCSV, type ExportColumn } from "@/lib/dataExport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const stageColors: Record<string, string> = {
  documents_received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  documentation_processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  customs_declaration: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  duty_payment: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  port_processing: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  cargo_release: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  truck_assignment: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  delivery_in_transit: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  delivery_completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const EXPORT_COLUMNS: ExportColumn<ConsignmentWorkflow>[] = [
  { header: "Ref", accessor: "consignment_ref" },
  { header: "Client", accessor: "client_name" },
  { header: "Stage", accessor: "current_stage" },
  { header: "Shipment Type", accessor: "shipment_type" },
  { header: "BL Number", accessor: "bl_number" },
  { header: "AWB Number", accessor: "awb_number" },
  { header: "Container", accessor: "container_number" },
  { header: "Origin", accessor: "origin_country" },
  { header: "Port of Loading", accessor: "port_of_loading" },
  { header: "Port of Discharge", accessor: "port_of_discharge" },
  { header: "Vessel", accessor: "vessel_name" },
  { header: "ETA", accessor: (r) => r.eta ? format(new Date(r.eta), "yyyy-MM-dd") : "" },
  { header: "Officer", accessor: "assigned_officer" },
  { header: "Urgent", accessor: "is_urgent" },
  { header: "Created", accessor: (r) => format(new Date(r.created_at), "yyyy-MM-dd") },
];

export default function ConsignmentWorkflows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("workflows");
  const [importOpen, setImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStage, setBulkStage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useConsignmentWorkflows({
    stage: stageFilter !== "all" ? (stageFilter as WorkflowStage) : undefined,
    search: searchQuery || undefined,
  });

  const stageCounts = workflows.reduce((acc, wf) => {
    acc[wf.current_stage] = (acc[wf.current_stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = workflows.filter((w) => w.current_stage !== "delivery_completed").length;
  const urgentCount = workflows.filter((w) => w.is_urgent).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === workflows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workflows.map((w) => w.id)));
    }
  };

  const handleExport = () => {
    const data = selectedIds.size > 0
      ? workflows.filter((w) => selectedIds.has(w.id))
      : workflows;
    exportToCSV(data, EXPORT_COLUMNS, "consignments");
    toast({ title: "Export complete", description: `${data.length} consignments exported to CSV` });
  };

  const handleBulkStageUpdate = async (stage: string) => {
    if (selectedIds.size === 0) return;
    const { error } = await supabase
      .from("consignment_workflows")
      .update({ current_stage: stage, stage_started_at: new Date().toISOString() } as any)
      .in("id", Array.from(selectedIds));

    if (error) {
      toast({ title: "Bulk update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `${selectedIds.size} consignments moved to ${stage.replace(/_/g, " ")}` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
    }
  };

  const handleBulkUrgent = async (urgent: boolean) => {
    if (selectedIds.size === 0) return;
    const { error } = await supabase
      .from("consignment_workflows")
      .update({ is_urgent: urgent } as any)
      .in("id", Array.from(selectedIds));

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `${selectedIds.size} consignments marked ${urgent ? "urgent" : "normal"}` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
    }
  };

  const handleImport = async (rows: Record<string, string>[]) => {
    const inserts = rows.map((r) => ({
      consignment_ref: r["consignment_ref"],
      client_name: r["client_name"],
      shipment_type: r["shipment_type"] || "sea",
      bl_number: r["bl_number"] || null,
      awb_number: r["awb_number"] || null,
      container_number: r["container_number"] || null,
      origin_country: r["origin_country"] || null,
      port_of_loading: r["port_of_loading"] || null,
      port_of_discharge: r["port_of_discharge"] || null,
      vessel_name: r["vessel_name"] || null,
      cargo_description: r["cargo_description"] || null,
    }));

    const { error } = await supabase.from("consignment_workflows").insert(inserts as any);
    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Import complete", description: `${inserts.length} consignments imported` });
    queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consignment Workflow</h1>
          <p className="text-muted-foreground">Track shipments from documents received to final delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" onClick={() => setActiveTab(activeTab === "automation" ? "workflows" : "automation")}>
            <Zap className="h-4 w-4 mr-2" />
            {activeTab === "automation" ? "View Workflows" : "SLA Monitor"}
          </Button>
          <Button onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Consignment
          </Button>
        </div>
      </div>

      {activeTab === "automation" ? (
        <WorkflowAutomationPanel />
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><div><p className="text-2xl font-bold">{workflows.length}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /><div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500" /><div><p className="text-2xl font-bold">{stageCounts["documentation_processing"] || 0}</p><p className="text-xs text-muted-foreground">In Documentation</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Ship className="h-4 w-4 text-orange-500" /><div><p className="text-2xl font-bold">{stageCounts["port_processing"] || 0}</p><p className="text-xs text-muted-foreground">Port Operations</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-teal-500" /><div><p className="text-2xl font-bold">{(stageCounts["truck_assignment"] || 0) + (stageCounts["delivery_in_transit"] || 0)}</p><p className="text-xs text-muted-foreground">Delivery</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><div><p className="text-2xl font-bold">{urgentCount}</p><p className="text-xs text-muted-foreground">Urgent</p></div></div></CardContent></Card>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
              <div className="h-4 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    Move to Stage <ArrowRight className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {WORKFLOW_STAGES.map((s) => (
                    <DropdownMenuItem key={s.key} onClick={() => handleBulkStageUpdate(s.key)}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive" onClick={() => handleBulkUrgent(true)}>
                <AlertTriangle className="h-3 w-3" /> Mark Urgent
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleBulkUrgent(false)}>
                <CheckCircle className="h-3 w-3" /> Remove Urgent
              </Button>
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={workflows.length > 0 && selectedIds.size === workflows.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by ref, client, container, BL..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {WORKFLOW_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label} ({stageCounts[s.key] || 0})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consignment List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No consignments found</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a new consignment to start tracking</p>
                <Button className="mt-4" onClick={() => setNewDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Consignment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {workflows.map((wf) => (
                <Card
                  key={wf.id}
                  className={cn("cursor-pointer hover:border-primary/50 transition-colors", selectedIds.has(wf.id) && "border-primary bg-primary/5")}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedIds.has(wf.id)}
                            onCheckedChange={() => toggleSelect(wf.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-2" onClick={() => setSelectedId(wf.id)}>
                            {wf.shipment_type === "air" ? <Plane className="h-4 w-4 text-muted-foreground" /> : wf.shipment_type === "road" ? <Truck className="h-4 w-4 text-muted-foreground" /> : <Ship className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-mono text-sm font-bold text-primary">{wf.consignment_ref}</span>
                          </div>
                          {wf.is_urgent && <Badge variant="destructive" className="text-[10px]">URGENT</Badge>}
                          <Badge className={cn("text-[10px]", stageColors[wf.current_stage])}>
                            {WORKFLOW_STAGES[STAGE_INDEX[wf.current_stage]]?.label}
                          </Badge>
                          {wf.current_stage !== "delivery_completed" && (
                            <SLABadge stage={wf.current_stage} stageStartedAt={wf.stage_started_at} createdAt={wf.created_at} compact />
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(wf.id)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs" onClick={() => setSelectedId(wf.id)}>
                        <div><span className="text-muted-foreground">Client: </span><span className="font-medium text-foreground">{wf.client_name}</span></div>
                        <div><span className="text-muted-foreground">Container: </span><span className="font-medium text-foreground">{wf.container_number || "—"}</span></div>
                        <div><span className="text-muted-foreground">BL: </span><span className="font-medium text-foreground">{wf.bl_number || wf.awb_number || "—"}</span></div>
                        <div><span className="text-muted-foreground">ETA: </span><span className="font-medium text-foreground">{wf.eta ? format(new Date(wf.eta), "MMM d, yyyy") : "—"}</span></div>
                        <div><span className="text-muted-foreground">Origin: </span><span className="font-medium text-foreground">{wf.port_of_loading || wf.origin_country || "—"}</span></div>
                      </div>

                      <WorkflowStageTracker currentStage={wf.current_stage} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <NewConsignmentDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />
      <ConsignmentDetailDialog workflowId={selectedId} open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
      <CSVImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Consignments"
        description="Upload a CSV with consignment data. Required: consignment_ref, client_name."
        requiredFields={["consignment_ref", "client_name"]}
        optionalFields={["shipment_type", "bl_number", "awb_number", "container_number", "origin_country", "port_of_loading", "port_of_discharge", "vessel_name", "cargo_description"]}
        onImport={handleImport}
      />
    </div>
  );
}
