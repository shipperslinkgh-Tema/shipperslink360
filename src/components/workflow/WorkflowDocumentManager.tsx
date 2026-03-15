import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { DOCUMENT_TYPES } from "@/types/workflow";
import { useUploadWorkflowDocument } from "@/hooks/useConsignmentWorkflow";
import { WorkflowDocument } from "@/types/workflow";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface WorkflowDocumentManagerProps {
  workflowId: string;
  stage: string;
  documents: WorkflowDocument[];
  readOnly?: boolean;
}

export function WorkflowDocumentManager({
  workflowId,
  stage,
  documents,
  readOnly = false,
}: WorkflowDocumentManagerProps) {
  const [selectedType, setSelectedType] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadWorkflowDocument();

  const stageDocuments = documents.filter((d) => d.stage === stage);

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return;
    await uploadMutation.mutateAsync({
      workflowId,
      file: selectedFile,
      documentType: selectedType,
      stage,
      notes: notes || undefined,
    });
    setSelectedFile(null);
    setSelectedType("");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4">
      {/* Existing documents */}
      {stageDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploaded Documents</h4>
          <div className="space-y-2">
            {stageDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.document_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label || doc.document_type}
                    </Badge>
                    <span>{formatSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{doc.uploaded_by_name}</span>
                    <span>•</span>
                    <span>{format(new Date(doc.created_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
                {doc.file_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload new document */}
      {!readOnly && (
        <div className="space-y-3 border border-dashed border-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground">Upload Document</h4>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this document..."
              className="h-16 text-sm"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedType || uploadMutation.isPending}
            size="sm"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Document
          </Button>
        </div>
      )}

      {stageDocuments.length === 0 && readOnly && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No documents uploaded for this stage.
        </p>
      )}
    </div>
  );
}
