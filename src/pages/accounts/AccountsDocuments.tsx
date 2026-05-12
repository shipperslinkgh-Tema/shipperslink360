import { useState, useRef } from "react";
import { FileText, Upload, Trash2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";

const BUCKET = "accounts-documents";

export default function AccountsDocuments() {
  const { canEdit } = useAccountsAccess();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    source: "shipping_line" as "shipping_line" | "customs" | "other",
    document_type: "invoice",
    party_name: "",
    reference_no: "",
    consignment_ref: "",
    customer: "",
    amount: "",
    currency: "GHS",
    document_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["accounts-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const delMut = useMutation({
    mutationFn: async (doc: any) => {
      if (doc.file_url) {
        const path = doc.file_url.split(`/${BUCKET}/`)[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
      }
      const { error } = await supabase.from("accounts_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts-documents"] });
      toast.success("Document deleted");
    },
    onError: (e: any) => toast.error(e.message || "Delete failed"),
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Select a file");
    if (!form.party_name) return toast.error("Enter party name");

    setUploading(true);
    try {
      const path = `${form.source}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: dbErr } = await supabase.from("accounts_documents").insert({
        source: form.source,
        document_type: form.document_type,
        party_name: form.party_name,
        reference_no: form.reference_no || null,
        consignment_ref: form.consignment_ref || null,
        customer: form.customer || null,
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency,
        document_date: form.document_date,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: `${(file.size / 1024).toFixed(1)} KB`,
        notes: form.notes || null,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (dbErr) throw dbErr;

      qc.invalidateQueries({ queryKey: ["accounts-documents"] });
      toast.success("Document uploaded");
      setOpen(false);
      setForm({ ...form, party_name: "", reference_no: "", consignment_ref: "", customer: "", amount: "", notes: "" });
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const path = url.split(`/${BUCKET}/`)[1];
      if (!path) return;
      const { data, error } = await supabase.storage.from(BUCKET).download(path);
      if (error) throw error;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(data);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Download failed");
    }
  };

  const filtered = docs.filter((d: any) => {
    const s = search.toLowerCase();
    const matches =
      !s ||
      d.file_name?.toLowerCase().includes(s) ||
      d.party_name?.toLowerCase().includes(s) ||
      d.reference_no?.toLowerCase().includes(s) ||
      d.consignment_ref?.toLowerCase().includes(s);
    const src = sourceFilter === "all" || d.source === sourceFilter;
    return matches && src;
  });

  const sourceLabel: Record<string, string> = {
    shipping_line: "Shipping Line",
    customs: "Customs",
    other: "Other",
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Shipping Line & Customs Invoices</h3>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Upload className="h-4 w-4" />Upload PDF</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Upload Invoice / Receipt</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Source *</Label>
                    <Select value={form.source} onValueChange={(v: any) => setForm({ ...form, source: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping_line">Shipping Line</SelectItem>
                        <SelectItem value="customs">Customs (GRA / ICUMS)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="duty_payment">Duty Payment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Party Name *</Label>
                    <Input value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} placeholder="e.g. Maersk, GRA Customs" />
                  </div>
                  <div>
                    <Label>Reference No.</Label>
                    <Input value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} placeholder="BL / Declaration / Receipt" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Consignment Ref</Label>
                    <Input value={form.consignment_ref} onChange={(e) => setForm({ ...form, consignment_ref: e.target.value })} />
                  </div>
                  <div>
                    <Label>Customer</Label>
                    <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GHS">GHS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.document_date} onChange={(e) => setForm({ ...form, document_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div>
                  <Label>File (PDF / Image) *</Label>
                  <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by file, party, ref, consignment..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="shipping_line">Shipping Line</SelectItem>
            <SelectItem value="customs">Customs</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party / Ref</TableHead>
              <TableHead>Consignment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No documents uploaded yet.</TableCell></TableRow>
            ) : (
              filtered.map((d: any) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{d.file_name}</p>
                        {d.file_size && <p className="text-xs text-muted-foreground">{d.file_size}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{sourceLabel[d.source] || d.source}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{d.document_type?.replace("_", " ")}</Badge></TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{d.party_name}</p>
                      {d.reference_no && <p className="text-xs text-muted-foreground font-mono">{d.reference_no}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.consignment_ref || "—"}</TableCell>
                  <TableCell className="text-right text-sm">
                    {d.amount ? `${d.currency} ${Number(d.amount).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.document_date ? format(new Date(d.document_date), "dd MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(d.file_url, d.file_name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => delMut.mutate(d)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t text-sm text-muted-foreground">{filtered.length} document(s)</div>
    </div>
  );
}
