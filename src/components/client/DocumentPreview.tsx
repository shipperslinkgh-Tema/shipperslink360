import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink, FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  doc: { document_name: string; file_url?: string | null; document_type?: string } | null;
  bucket?: string;
}

export function DocumentPreview({ open, onClose, doc, bucket = "client-documents" }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !doc?.file_url) { setUrl(null); return; }
    setLoading(true);
    supabase.storage.from(bucket).createSignedUrl(doc.file_url, 300).then(({ data }) => {
      setUrl(data?.signedUrl || null);
      setLoading(false);
    });
  }, [open, doc, bucket]);

  if (!doc) return null;
  const ext = (doc.file_url || "").split(".").pop()?.toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
  const isPdf = ext === "pdf";
  const baseName = (doc.document_name || "document").replace(/\.[^.]+$/, "");

  const downloadAsPdf = async () => {
    if (!url) return;
    try {
      if (isPdf) {
        // Already a PDF — fetch and trigger a forced download
        const res = await fetch(url);
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${baseName}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
        return;
      }
      if (isImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image failed to load"));
          img.src = url;
        });
        const orientation = img.width >= img.height ? "landscape" : "portrait";
        const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        const fmt = ext === "png" ? "PNG" : "JPEG";
        pdf.addImage(img, fmt, x, y, w, h);
        pdf.save(`${baseName}.pdf`);
        return;
      }
      toast.error("PDF conversion is only supported for PDF and image files");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to download as PDF");
    }
  };

  const canPdf = isPdf || isImage;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 pr-6">
            <span className="truncate">{doc.document_name}</span>
            <div className="flex gap-2 flex-wrap">
              {url && (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" /> Open</a>
                  </Button>
                  {canPdf && (
                    <Button size="sm" variant="outline" onClick={downloadAsPdf}>
                      <FileDown className="h-4 w-4 mr-1" /> Download as PDF
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <a href={url} download={doc.document_name}><Download className="h-4 w-4 mr-1" /> Download</a>
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
          {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
          {!loading && url && isPdf && (
            <iframe src={url} title={doc.document_name} className="w-full h-full" />
          )}
          {!loading && url && isImage && (
            <img src={url} alt={doc.document_name} className="max-w-full max-h-full object-contain" />
          )}
          {!loading && url && !isPdf && !isImage && (
            <div className="text-center p-8">
              <p className="text-sm text-muted-foreground mb-3">Preview not available for this file type.</p>
              <Button asChild><a href={url} download={doc.document_name}><Download className="h-4 w-4 mr-1" /> Download</a></Button>
            </div>
          )}
          {!loading && !url && (
            <p className="text-sm text-muted-foreground">Unable to load document.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
