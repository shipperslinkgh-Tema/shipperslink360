import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Search, Download } from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
  { value: "sop", label: "SOP" },
  { value: "bill_of_lading", label: "Bill of Lading" },
  { value: "customs_declaration", label: "Customs Declaration" },
  { value: "invoice", label: "Invoice" },
  { value: "packing_list", label: "Packing List" },
  { value: "certificate_of_origin", label: "Certificate of Origin" },
  { value: "delivery_order", label: "Delivery Order" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(DOC_TYPES.map(d => [d.value, d.label]));

export default function ClientDocumentManagement() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customer_id: "",
    document_name: "",
    document_type: "sop",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    const query = supabase.from("client_documents").select("*").order("created_at", { ascending: false });
    const { data } = await query;
    setDocuments(data || []);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("client_profiles").select("customer_id, company_name").order("company_name");
    setClients(data || []);
  };

  useEffect(() => { fetchDocuments(); fetchClients(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.customer_id) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${form.customer_id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("client-documents")
        .getPublicUrl(filePath);

      // Format file size
      const sizeKB = (file.size / 1024).toFixed(1);
      const fileSize = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeKB} KB`;

      const { error: dbError } = await supabase.from("client_documents").insert({
        customer_id: form.customer_id,
        document_name: form.document_name || file.name,
        document_type: form.document_type,
        file_url: filePath, // Store the path, not public URL (bucket is private)
        file_size: fileSize,
        notes: form.notes || null,
        status: "active",
      });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      setOpen(false);
      setForm({ customer_id: "", document_name: "", document_type: "sop", notes: "" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
  };

  const handleDelete = async (doc: any) => {
    if (!confirm(`Delete "${doc.document_name}"?`)) return;
    try {
      if (doc.file_url) {
        await supabase.storage.from("client-documents").remove([doc.file_url]);
      }
      await supabase.from("client_documents").delete().eq("id", doc.id);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleDownload = async (doc: any) => {
    if (!doc.file_url) return;
    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_url, 60);
    if (error || !data?.signedUrl) {
      toast.error("Failed to generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.document_name.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase());
    const matchCustomer = filterCustomer === "all" || d.customer_id === filterCustomer;
    return matchSearch && matchCustomer;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Client Document Management
          </h1>
          <p className="text-muted-foreground text-sm">Upload and manage documents for client portal access</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Upload Client Document</DialogTitle></DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select value={form.customer_id} onValueChange={v => setForm(f => ({ ...f, customer_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.customer_id} value={c.customer_id}>{c.company_name} ({c.customer_id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Document Name</Label>
                  <Input value={form.document_name} onChange={e => setForm(f => ({ ...f, document_name: e.target.value }))} placeholder="Leave blank to use filename" />
                </div>
                <div className="space-y-1.5">
                  <Label>Document Type *</Label>
                  <Select value={form.document_type} onValueChange={v => setForm(f => ({ ...f, document_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>File *</Label>
                <Input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} required accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv" />
                <p className="text-xs text-muted-foreground">Max 20MB. PDF, Word, Excel, Images, CSV</p>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={uploading || !file || !form.customer_id}>
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c.customer_id} value={c.customer_id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No documents found. Upload one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.document_name}</TableCell>
                    <TableCell className="text-sm font-mono">{d.customer_id}</TableCell>
                    <TableCell><Badge variant="secondary">{TYPE_LABELS[d.document_type] || d.document_type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={`border-0 ${d.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.file_size || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {d.file_url && (
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(d)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(d)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
