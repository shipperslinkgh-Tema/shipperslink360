import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileSearch, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import { useDocumentProcessor, type ExtractedDocumentData } from "@/hooks/useDocumentProcessor";

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedDocumentData) => void;
  compact?: boolean;
}

const DOC_TYPES = [
  { value: "auto", label: "Auto-detect" },
  { value: "bill_of_lading", label: "Bill of Lading" },
  { value: "commercial_invoice", label: "Commercial Invoice" },
  { value: "packing_list", label: "Packing List" },
  { value: "air_waybill", label: "Air Waybill" },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  bill_of_lading: "Bill of Lading",
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  air_waybill: "Air Waybill",
  unknown: "Unknown Document",
};

export function DocumentScanner({ onDataExtracted, compact }: DocumentScannerProps) {
  const [docType, setDocType] = useState("auto");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processDocument, isProcessing, extractedData } = useDocumentProcessor();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    const hint = docType !== "auto" ? docType : undefined;
    const result = await processDocument(selectedFile, hint);
    if (result) {
      onDataExtracted(result);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fieldsExtracted = extractedData
    ? Object.entries(extractedData).filter(
        ([k, v]) => v != null && v !== "" && k !== "confidence_notes" && k !== "document_type" && k !== "line_items"
      ).length
    : 0;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Document Scanner</span>
          {extractedData && (
            <Badge variant="secondary" className="text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {fieldsExtracted} fields extracted
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {!selectedFile ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload Document
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <FileSearch className="h-3 w-3 mr-1" />
                )}
                {isProcessing ? "Scanning..." : "Extract Data"}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={handleClear}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        {selectedFile && (
          <p className="text-[10px] text-muted-foreground truncate">
            📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
          </p>
        )}
        {extractedData?.confidence_notes && (
          <p className="text-[10px] text-muted-foreground flex items-start gap-1">
            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
            {extractedData.confidence_notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 border-dashed border-2 border-primary/20 bg-primary/5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI Document Scanner</h3>
          </div>
          {extractedData && (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {DOC_TYPE_LABELS[extractedData.document_type] || "Document"} — {fieldsExtracted} fields extracted
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Upload a BL, Commercial Invoice, Packing List, or AWB to auto-fill consignment fields.
        </p>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Document
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                className="h-9"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSearch className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? "Scanning..." : "Extract Data"}
              </Button>
              <Button type="button" variant="ghost" className="h-9 px-2" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3">
            {previewUrl && (
              <img src={previewUrl} alt="Document preview" className="h-16 w-16 object-cover rounded border" />
            )}
            <div>
              <p className="text-xs font-medium truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
        )}

        {extractedData?.confidence_notes && (
          <div className="flex items-start gap-2 p-2 bg-muted rounded text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{extractedData.confidence_notes}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
