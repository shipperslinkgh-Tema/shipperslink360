import { useState, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { parseCSV, validateImport } from "@/lib/dataExport";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  requiredFields: string[];
  optionalFields?: string[];
  onImport: (rows: Record<string, string>[]) => Promise<void>;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  title,
  description,
  requiredFields,
  optionalFields = [],
  onImport,
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [validation, setValidation] = useState<{
    valid: Record<string, string>[];
    errors: { row: number; field: string; message: string }[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setValidation(null);
    setImporting(false);
    setDone(false);
  };

  const handleFile = useCallback(
    async (f: File) => {
      setFile(f);
      setDone(false);
      const text = await f.text();
      const parsed = parseCSV(text);
      setPreview(parsed);
      const result = validateImport(parsed.rows, requiredFields);
      setValidation(result);
    },
    [requiredFields]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith(".csv")) handleFile(f);
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!validation?.valid.length) return;
    setImporting(true);
    try {
      await onImport(validation.valid);
      setDone(true);
    } catch {
      // error handled by parent
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <p className="font-medium">Import Complete!</p>
            <p className="text-sm text-muted-foreground">
              {validation?.valid.length} records imported successfully.
            </p>
            <Button onClick={() => { reset(); onOpenChange(false); }}>Close</Button>
          </div>
        ) : !preview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".csv";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }}
          >
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-sm">Drop a CSV file or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">
              Required columns: {requiredFields.join(", ")}
            </p>
            {optionalFields.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Optional: {optionalFields.join(", ")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file?.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({preview.rows.length} rows)
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Validation summary */}
            <div className="flex gap-3">
              <Badge variant="outline" className="gap-1 text-success border-success/30">
                <CheckCircle className="h-3 w-3" /> {validation?.valid.length || 0} valid
              </Badge>
              {(validation?.errors.length || 0) > 0 && (
                <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                  <AlertTriangle className="h-3 w-3" /> {validation?.errors.length} errors
                </Badge>
              )}
            </div>

            {/* Errors */}
            {validation && validation.errors.length > 0 && (
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-1">
                  {validation.errors.slice(0, 20).map((err, i) => (
                    <p key={i} className="text-xs text-destructive">
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                  {validation.errors.length > 20 && (
                    <p className="text-xs text-muted-foreground">
                      ...and {validation.errors.length - 20} more errors
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Preview table */}
            <ScrollArea className="h-48 rounded border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {preview.headers.slice(0, 6).map((h) => (
                      <th key={h} className={cn("p-2 text-left font-medium", requiredFields.includes(h) && "text-primary")}>
                        {h} {requiredFields.includes(h) && "*"}
                      </th>
                    ))}
                    {preview.headers.length > 6 && <th className="p-2 text-muted-foreground">+{preview.headers.length - 6} more</th>}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b">
                      {preview.headers.slice(0, 6).map((h) => (
                        <td key={h} className="p-2 truncate max-w-[120px]">
                          {row[h] || <span className="text-muted-foreground">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        {preview && !done && (
          <DialogFooter>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !validation?.valid.length}
              className="gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Import {validation?.valid.length} Records
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
