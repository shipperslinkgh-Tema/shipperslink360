import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScanLine, Upload, FileCheck, Loader2, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DOC_CATEGORIES = [
  { value: "customs", label: "Customs (BOE, IDF)" },
  { value: "shipping_line", label: "Shipping Line (Invoice, Receipt, DO)" },
  { value: "company_financial", label: "Company Financial (Invoice, Receipt)" },
  { value: "warehouse", label: "Warehouse (GRN, Release Note)" },
  { value: "shipping", label: "Shipping (BL, AWB, Packing List)" },
  { value: "other", label: "Other" },
];

const DOC_TYPES = [
  "Bill of Entry", "IDF", "BL", "AWB", "Commercial Invoice", "Packing List",
  "Delivery Order", "Shipping Line Invoice", "Shipping Line Receipt",
  "Client Invoice", "Client Receipt", "Expense Voucher", "GRN",
  "Release Note", "Customs Assessment", "Tax Receipt", "Other",
];

export function DocumentScanUpload() {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [docType, setDocType] = useState("");
  const [consignmentRef, setConsignmentRef] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      if (f.type.startsWith("image/")) {
        setPreviews((prev) => [...prev, URL.createObjectURL(f)]);
      } else {
        setPreviews((prev) => [...prev, ""]);
      }
    });
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!files.length || !category || !docType) {
      toast.error("Please select file(s), category, and document type");
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `scanned/${consignmentRef || "general"}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("consignment-files")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("consignment-files")
          .getPublicUrl(path);

        // If there's a consignment ref, save as a consignment document
        if (consignmentRef) {
          // Try to find matching completed consignment
          const { data: consignment } = await supabase
            .from("completed_consignments")
            .select("id")
            .eq("consignment_ref", consignmentRef)
            .maybeSingle();

          if (consignment) {
            await supabase.from("consignment_documents").insert({
              consignment_id: consignment.id,
              category,
              document_type: docType,
              document_name: file.name,
              file_url: path,
              file_size: file.size,
              mime_type: file.type,
              uploaded_by: profile?.user_id || "",
              uploaded_by_name: profile?.full_name || "Staff",
              notes,
            });
          }
        }
      }

      toast.success(`${files.length} document(s) scanned & saved successfully`);
      setFiles([]);
      setPreviews([]);
      setCategory("");
      setDocType("");
      setConsignmentRef("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-5 border-dashed border-2 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <ScanLine className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Scan & Save Documents</h3>
      </div>

      <div className="space-y-4">
        {/* File Selection */}
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to scan or upload documents
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports: PDF, JPG, PNG, TIFF
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.tiff"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group bg-muted rounded-lg p-2 flex items-center gap-2 text-xs">
                {previews[i] ? (
                  <img src={previews[i]} alt="" className="h-10 w-10 object-cover rounded" />
                ) : (
                  <FileCheck className="h-5 w-5 text-primary" />
                )}
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {DOC_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Document Type *</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Consignment Ref (optional)</Label>
            <Input
              placeholder="e.g. CON-2026-001"
              value={consignmentRef}
              onChange={(e) => setConsignmentRef(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Input
              placeholder="Brief description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!files.length || !category || !docType || uploading}
          className="w-full gap-2"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
          {uploading ? "Saving..." : `Save ${files.length || ""} Document${files.length > 1 ? "s" : ""}`}
        </Button>
      </div>
    </Card>
  );
}
