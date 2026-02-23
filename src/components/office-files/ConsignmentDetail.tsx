import { useState, useCallback } from "react";
import { ArrowLeft, Ship, Plane, Lock, Upload, FileText, History, Shield, CheckCircle2, XCircle, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCompletedConsignments,
  useConsignmentDocuments,
  useConsignmentAuditLogs,
  useUploadConsignmentDocument,
  useDownloadConsignmentDocument,
  DOCUMENT_CHECKLIST,
  type ConsignmentDocument,
} from "@/hooks/useCompletedConsignments";
import { DocumentUploadZone } from "./DocumentUploadZone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  consignmentId: string;
  onBack: () => void;
}

export function ConsignmentDetail({ consignmentId, onBack }: Props) {
  const { data: consignments = [] } = useCompletedConsignments();
  const consignment = consignments.find(c => c.id === consignmentId);
  const { data: documents = [], isLoading: docsLoading } = useConsignmentDocuments(consignmentId);
  const { data: auditLogs = [] } = useConsignmentAuditLogs(consignmentId);
  const downloadMutation = useDownloadConsignmentDocument();
  const { isAdmin } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const handlePreview = async (doc: ConsignmentDocument) => {
    if (!doc.file_url) return;
    const { data } = await supabase.storage.from("consignment-files").createSignedUrl(doc.file_url, 300);
    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setPreviewName(doc.document_name);
    }
  };

  if (!consignment) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Consignment not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Build checklist status
  const getDocStatus = (category: string, docType: string) =>
    documents.some(d => d.category === category && d.document_type === docType);

  const totalRequired = Object.values(DOCUMENT_CHECKLIST).reduce((s, c) => s + c.types.length, 0);
  const totalUploaded = Object.entries(DOCUMENT_CHECKLIST).reduce(
    (s, [cat, c]) => s + c.types.filter(t => getDocStatus(cat, t)).length, 0
  );

  const profit = (consignment.total_revenue || 0) - (consignment.total_expenses || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              consignment.shipment_type === "sea" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
            )}>
              {consignment.shipment_type === "sea" ? <Ship className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{consignment.consignment_ref}</h1>
              <p className="text-sm text-muted-foreground">{consignment.client_name}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              <Lock className="h-3 w-3 mr-1" /> Completed & Locked
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Consignment ID</p>
              <p className="font-mono font-medium">{consignment.consignment_ref}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{consignment.shipment_type === "sea" ? "BL Number" : "AWB Number"}</p>
              <p className="font-mono font-medium">{consignment.bl_number || consignment.awb_number || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Container(s)</p>
              <p className="font-mono font-medium">{consignment.container_numbers?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="font-medium">{consignment.client_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Type</p>
              <Badge variant="secondary" className="capitalize">{consignment.shipment_type}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Clearance Date</p>
              <p className="font-medium">{consignment.clearance_date ? new Date(consignment.clearance_date).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Delivery Date</p>
              <p className="font-medium">{consignment.delivery_date ? new Date(consignment.delivery_date).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Officer in Charge</p>
              <p className="font-medium">{consignment.officer_in_charge}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-xl font-bold text-success">GHS {(consignment.total_revenue || 0).toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-destructive">GHS {(consignment.total_expenses || 0).toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Profit</p>
          <p className={cn("text-xl font-bold", profit >= 0 ? "text-success" : "text-destructive")}>
            GHS {profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist" className="gap-1.5">
            <FileText className="h-4 w-4" /> Documents ({totalUploaded}/{totalRequired})
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="h-4 w-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <History className="h-4 w-4" /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Document Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          {Object.entries(DOCUMENT_CHECKLIST).map(([catKey, cat]) => (
            <Card key={catKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {cat.category}
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {cat.types.filter(t => getDocStatus(catKey, t)).length}/{cat.types.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.types.map((docType) => {
                  const uploaded = getDocStatus(catKey, docType);
                  const doc = documents.find(d => d.category === catKey && d.document_type === docType);
                  return (
                    <div key={docType} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                      {uploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive/50 shrink-0" />
                      )}
                      <span className={cn("text-sm flex-1", uploaded ? "text-foreground" : "text-muted-foreground")}>
                        {docType}
                      </span>
                      {doc && (
                        <div className="flex gap-1">
                          {doc.mime_type?.includes("pdf") && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePreview(doc)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadMutation.mutate(doc)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {doc.version > 1 && (
                            <Badge variant="outline" className="text-[10px]">v{doc.version}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <DocumentUploadZone consignmentId={consignmentId} isAdmin={isAdmin} />
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-sm border-b border-border/30 pb-3 last:border-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground">
                          <span className="font-medium">{log.performed_by_name}</span>{" "}
                          <span className="text-muted-foreground">{log.action.replace(/_/g, " ")}</span>
                        </p>
                        {log.action_details && (
                          <p className="text-xs text-muted-foreground truncate">
                            {JSON.stringify(log.action_details)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe src={previewUrl} className="w-full flex-1 rounded-lg border" title="PDF Preview" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
