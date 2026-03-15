import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight, FileText, Clock, Package, Ship, Plane, Truck,
  AlertTriangle, CheckCircle, Send, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useConsignmentWorkflow,
  useWorkflowDocuments,
  useWorkflowTimeline,
  useAdvanceWorkflowStage,
} from "@/hooks/useConsignmentWorkflow";
import { WORKFLOW_STAGES, STAGE_INDEX, type WorkflowStage } from "@/types/workflow";
import { WorkflowStageTracker } from "./WorkflowStageTracker";
import { WorkflowTimelineView } from "./WorkflowTimelineView";
import { WorkflowDocumentManager } from "./WorkflowDocumentManager";
import { useAuth } from "@/contexts/AuthContext";

interface ConsignmentDetailDialogProps {
  workflowId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stageActionLabels: Record<string, string> = {
  documents_received: "Send to Documentation",
  documentation_processing: "Submit to Customs",
  customs_declaration: "Mark Duty Paid",
  duty_payment: "Send to Port Operations",
  port_processing: "Release Container",
  cargo_release: "Assign Truck",
  truck_assignment: "Start Delivery",
  delivery_in_transit: "Complete Delivery",
};

const stageDepartmentLabels: Record<string, string> = {
  documents_received: "Management",
  documentation_processing: "Documentation",
  customs_declaration: "Documentation",
  duty_payment: "Accounts",
  port_processing: "Operations",
  cargo_release: "Operations",
  truck_assignment: "Trucking",
  delivery_in_transit: "Trucking",
  delivery_completed: "Completed",
};

export function ConsignmentDetailDialog({
  workflowId,
  open,
  onOpenChange,
}: ConsignmentDetailDialogProps) {
  const { profile } = useAuth();
  const { data: workflow, isLoading } = useConsignmentWorkflow(workflowId || undefined);
  const { data: documents = [] } = useWorkflowDocuments(workflowId || undefined);
  const { data: timeline = [] } = useWorkflowTimeline(workflowId || undefined);
  const advanceMutation = useAdvanceWorkflowStage();

  const [activeTab, setActiveTab] = useState("overview");

  if (!workflow) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStageInfo = WORKFLOW_STAGES[STAGE_INDEX[workflow.current_stage]];
  const actionLabel = stageActionLabels[workflow.current_stage];
  const isCompleted = workflow.current_stage === "delivery_completed";

  const handleAdvance = async () => {
    if (!workflowId) return;
    await advanceMutation.mutateAsync({
      workflowId,
      currentStage: workflow.current_stage,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-mono text-lg">
                {workflow.consignment_ref}
              </DialogTitle>
              {workflow.is_urgent && (
                <Badge variant="destructive">URGENT</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {workflow.shipment_type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Stage Tracker */}
        <WorkflowStageTracker currentStage={workflow.current_stage} className="my-4" />

        {/* Current Stage Action */}
        {!isCompleted && actionLabel && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Current Stage: <span className="text-primary">{currentStageInfo?.label}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Department: {stageDepartmentLabels[workflow.current_stage]}
                </p>
              </div>
              <Button onClick={handleAdvance} disabled={advanceMutation.isPending}>
                {advanceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {actionLabel}
              </Button>
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="border-green-500/30 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Delivery Completed
                </p>
                <p className="text-xs text-green-600/70">
                  {workflow.delivery_completed_at &&
                    format(new Date(workflow.delivery_completed_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="customs">Customs</TabsTrigger>
            <TabsTrigger value="port">Port Ops</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Client & Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{workflow.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span>{workflow.client_contact || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier</span>
                    <span>{workflow.supplier_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Officer</span>
                    <span>{workflow.assigned_officer || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Container</span>
                    <span className="font-mono">{workflow.container_number || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BL/AWB</span>
                    <span className="font-mono">{workflow.bl_number || workflow.awb_number || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Origin</span>
                    <span>{workflow.port_of_loading || "—"} → {workflow.port_of_discharge || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span>{workflow.eta ? format(new Date(workflow.eta), "MMM d, yyyy") : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cargo</span>
                    <span className="truncate max-w-[200px]">{workflow.cargo_description || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight/Volume</span>
                    <span>
                      {workflow.weight_kg ? `${workflow.weight_kg} KG` : "—"} / {workflow.volume_cbm ? `${workflow.volume_cbm} CBM` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {workflow.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{workflow.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <WorkflowDocumentManager
              workflowId={workflow.id}
              stage={workflow.current_stage}
              documents={documents}
            />
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <WorkflowTimelineView events={timeline} />
          </TabsContent>

          {/* Customs */}
          <TabsContent value="customs" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Customs Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ICUMS Declaration</span>
                  <span className="font-mono">{workflow.icums_declaration_number || "Not filed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HS Code</span>
                  <span>{workflow.hs_code || "—"}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FOB</span>
                    <span>{workflow.fob_value ? `$${workflow.fob_value}` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Freight</span>
                    <span>{workflow.freight_value ? `$${workflow.freight_value}` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span>{workflow.insurance_value ? `$${workflow.insurance_value}` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CIF</span>
                    <span className="font-medium">{workflow.cif_value ? `$${workflow.cif_value}` : "—"}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Duty Amount</span>
                  <span className="text-primary">
                    {workflow.duty_amount ? `GHS ${workflow.duty_amount.toLocaleString()}` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Port Operations */}
          <TabsContent value="port" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Port Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Order</span>
                  <span className="font-mono">{workflow.delivery_order_number || "Not issued"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Line</span>
                  <span>{workflow.shipping_line || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terminal</span>
                  <span>{workflow.terminal || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Days</span>
                  <span>{workflow.free_days || 14} days</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Line Charges</span>
                  <span>{workflow.shipping_line_charges ? `GHS ${workflow.shipping_line_charges.toLocaleString()}` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terminal Charges</span>
                  <span>{workflow.terminal_charges ? `GHS ${workflow.terminal_charges.toLocaleString()}` : "—"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
