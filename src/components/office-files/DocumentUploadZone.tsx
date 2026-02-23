import { useState, useCallback, useRef } from "react";
import { Upload, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUploadConsignmentDocument, DOCUMENT_CHECKLIST } from "@/hooks/useCompletedConsignments";

interface Props {
  consignmentId: string;
  isAdmin: boolean;
}

export function DocumentUploadZone({ consignmentId, isAdmin }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadConsignmentDocument();

  const docTypes = selectedCategory ? DOCUMENT_CHECKLIST[selectedCategory]?.types || [] : [];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (!selectedCategory || !selectedDocType || files.length === 0) return;
    for (const file of files) {
      await uploadMutation.mutateAsync({
        consignmentId,
        category: selectedCategory,
        documentType: selectedDocType,
        file,
        notes: notes || undefined,
      });
    }
    setFiles([]);
    setNotes("");
    setSelectedDocType("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Document Category *</Label>
          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedDocType(""); }}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_CHECKLIST).map(([key, cat]) => (
                <SelectItem key={key} value={key}>{cat.category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Document Type *</Label>
          <Select value={selectedDocType} onValueChange={setSelectedDocType} disabled={!selectedCategory}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {docTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
        />
        <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Drag & drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX — max 50MB per file</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-sm">
              <Upload className="h-4 w-4 text-primary shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this upload..." rows={2} />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!selectedCategory || !selectedDocType || files.length === 0 || uploadMutation.isPending}
        className="w-full gap-2"
      >
        <Upload className="h-4 w-4" />
        {uploadMutation.isPending ? "Uploading..." : `Upload ${files.length} File(s)`}
      </Button>
    </div>
  );
}
