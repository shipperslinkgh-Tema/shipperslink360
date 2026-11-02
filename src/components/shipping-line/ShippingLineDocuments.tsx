import { useState, useMemo, useRef } from "react";
import { FileText, Upload, Trash2, Download, Search, CalendarClock, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  daysUntil,
  expiringBLCount,
  freeDaysExpiry,
  freeDaysLevel,
  summariseBLFreeDays,
  todayISO,
  type FreeDaysLevel,
} from "@/lib/freeDays";

const SHIPPING_LINES = ["Maersk", "CMA CGM", "ONE", "ODeX", "ZIM", "MSC"];

const LEVEL_TEXT: Record<FreeDaysLevel, string> = {
  unknown: "text-muted-foreground",
  expired: "text-destructive",
  critical: "text-destructive",
  warning: "text-warning",
  ok: "text-success",
};

const LEVEL_LABEL: Record<FreeDaysLevel, string> = {
  unknown: "No ETA / free days",
  expired: "Free days over",
  critical: "Expiring now",
  warning: "Expiring soon",
  ok: "Within free days",
};

function freeDaysLabel(eta: string | null, freeDays: number | null, today: string) {
  const expiry = freeDaysExpiry(eta, freeDays);
  const left = daysUntil(expiry, today);
  const level = freeDaysLevel(left);
  return { expiry, left, level };
}

export function ShippingLineDocuments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lineFilter, setLineFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Upload form state
  const [formData, setFormData] = useState({
    shipping_line: "",
    document_type: "invoice",
    bl_number: "",
    container_number: "",
    eta: "",
    free_days: "",
    notes: "",
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["shipping-line-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_line_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const today = todayISO();
  const blRows = useMemo(() => summariseBLFreeDays(documents, today), [documents, today]);
  const expiring = expiringBLCount(blRows);

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; file_url: string | null }) => {
      if (doc.file_url) {
        const path = doc.file_url.split("/shipping-line-docs/")[1];
        if (path) {
          await supabase.storage.from("shipping-line-docs").remove([path]);
        }
      }
      const { error } = await supabase
        .from("shipping_line_documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-line-documents"] });
      toast.success("Document deleted");
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const resetForm = () =>
    setFormData({
      shipping_line: "",
      document_type: "invoice",
      bl_number: "",
      container_number: "",
      eta: "",
      free_days: "",
      notes: "",
    });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !formData.shipping_line) {
      toast.error("Please select a file and shipping line");
      return;
    }
    const freeDays = formData.free_days.trim() === "" ? null : Number(formData.free_days);
    if (freeDays != null && !Number.isFinite(freeDays)) {
      toast.error("Free days must be a whole number");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${formData.shipping_line}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("shipping-line-docs")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("shipping-line-docs")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("shipping_line_documents")
        .insert({
          shipping_line: formData.shipping_line,
          document_type: formData.document_type,
          document_name: file.name,
          file_url: urlData.publicUrl,
          file_size: `${(file.size / 1024).toFixed(1)} KB`,
          bl_number: formData.bl_number.trim() || null,
          container_number: formData.container_number.trim() || null,
          eta: formData.eta || null,
          free_days: freeDays,
          notes: formData.notes || null,
        });
      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["shipping-line-documents"] });
      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      resetForm();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const path = fileUrl.split("/shipping-line-docs/")[1];
      if (!path) return;
      const { data, error } = await supabase.storage
        .from("shipping-line-docs")
        .download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.bl_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.container_number || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    const matchesLine = lineFilter === "all" || doc.shipping_line === lineFilter;
    return matchesSearch && matchesType && matchesLine;
  });

  return (
    <div className="space-y-6">
      {/* Bill of Lading ETA & free days, built from the uploads below */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Bill of Lading — ETA &amp; Free Days</h3>
              <p className="text-xs text-muted-foreground">
                Taken from the invoices and receipts uploaded against each BL.
              </p>
            </div>
          </div>
          {expiring > 0 && (
            <Badge variant="outline" className="text-destructive border-destructive/40">
              {expiring} BL{expiring === 1 ? "" : "s"} expiring
            </Badge>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BL Number</TableHead>
                <TableHead>Shipping Line</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Free Days</TableHead>
                <TableHead>Free Days End</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Uploads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Upload an invoice with a BL number, ETA and free days to track them here.
                  </TableCell>
                </TableRow>
              ) : (
                blRows.map((row) => (
                  <TableRow key={row.bl} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-medium">{row.bl}</TableCell>
                    <TableCell><Badge variant="outline">{row.shippingLine}</Badge></TableCell>
                    <TableCell className="text-xs">
                      {row.eta ? format(new Date(`${row.eta}T00:00:00`), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{row.freeDays ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {row.expiry ? format(new Date(`${row.expiry}T00:00:00`), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={LEVEL_TEXT[row.level]}>
                        {row.daysLeft == null ? "—" : `${row.daysLeft} left`}
                      </span>
                      <span className={LEVEL_TEXT[row.level]}> · {LEVEL_LABEL[row.level]}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.documents}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Saved invoices & receipts */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Saved Invoices & Receipts</h3>
            </div>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Shipping Line Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Shipping Line *</Label>
                      <Select value={formData.shipping_line} onValueChange={(v) => setFormData({ ...formData, shipping_line: v })}>
                        <SelectTrigger><SelectValue placeholder="Select line" /></SelectTrigger>
                        <SelectContent>
                          {SHIPPING_LINES.map((line) => (
                            <SelectItem key={line} value={line}>{line}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Document Type *</Label>
                      <Select value={formData.document_type} onValueChange={(v) => setFormData({ ...formData, document_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="do">Delivery Order</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>BL Number</Label>
                      <Input value={formData.bl_number} onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })} placeholder="e.g. MSKU2345678" />
                    </div>
                    <div>
                      <Label>Container Number</Label>
                      <Input value={formData.container_number} onChange={(e) => setFormData({ ...formData, container_number: e.target.value })} placeholder="e.g. MSKU1234567" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vessel ETA</Label>
                      <Input type="date" value={formData.eta} onChange={(e) => setFormData({ ...formData, eta: e.target.value })} />
                    </div>
                    <div>
                      <Label>Free Days</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={formData.free_days}
                        onChange={(e) => setFormData({ ...formData, free_days: e.target.value })}
                        placeholder="e.g. 14"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    ETA and free days are recorded against this BL and shown in the ETA &amp; Free Days
                    section above.
                  </p>
                  <div>
                    <Label>Notes</Label>
                    <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
                  </div>
                  <div>
                    <Label>File (PDF) *</Label>
                    <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  </div>
                  <Button onClick={handleUpload} disabled={uploading} className="w-full">
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, BL, or container..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="receipt">Receipts</SelectItem>
              <SelectItem value="do">Delivery Orders</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lineFilter} onValueChange={setLineFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              {SHIPPING_LINES.map((line) => (
                <SelectItem key={line} value={line}>{line}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Shipping Line</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>BL / Container</TableHead>
                <TableHead>ETA / Free Days</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No documents found. Upload invoices and receipts from shipping line portals.</TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => {
                  const { expiry, left, level } = freeDaysLabel(doc.eta, doc.free_days, today);
                  return (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">{doc.document_name}</p>
                            {doc.file_size && <p className="text-xs text-muted-foreground">{doc.file_size}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{doc.shipping_line}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{doc.document_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {doc.bl_number && <p className="text-xs font-mono">{doc.bl_number}</p>}
                          {doc.container_number && <p className="text-xs text-muted-foreground font-mono">{doc.container_number}</p>}
                          {!doc.bl_number && !doc.container_number && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {doc.eta || doc.free_days != null ? (
                          <div>
                            <p className="flex items-center gap-1">
                              <Anchor className="h-3 w-3 text-muted-foreground" />
                              {doc.eta ? format(new Date(`${doc.eta}T00:00:00`), "dd MMM yyyy") : "No ETA"}
                              {doc.free_days != null && <span className="text-muted-foreground"> · {doc.free_days} free</span>}
                            </p>
                            <p className={LEVEL_TEXT[level]}>
                              {expiry
                                ? `${format(new Date(`${expiry}T00:00:00`), "dd MMM yyyy")}${left != null ? ` · ${left} left` : ""}`
                                : "Free days end unknown"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.file_url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc.file_url!, doc.document_name)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate({ id: doc.id, file_url: doc.file_url })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">{filtered.length} document(s)</p>
        </div>
      </div>
    </div>
  );
}

