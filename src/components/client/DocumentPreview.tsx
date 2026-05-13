import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink, Loader2 } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 pr-6">
            <span className="truncate">{doc.document_name}</span>
            <div className="flex gap-2">
              {url && (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" /> Open</a>
                  </Button>
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
