import { useState, useEffect, useRef } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, FolderOpen, File, FileCheck, Upload, Send, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/client/DocumentPreview";

const UPLOAD_TYPES = [
  { value: "bill_of_lading", label: "Bill of Lading" },
  { value: "packing_list", label: "Packing List" },
  { value: "invoice", label: "Commercial Invoice" },
  { value: "certificate_of_origin", label: "Certificate of Origin" },
  { value: "customs_declaration", label: "Customs Declaration" },
  { value: "delivery_order", label: "Delivery Order" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS: Record<string, string> = {
  sop: "SOP",
  bill_of_lading: "Bill of Lading",
  customs_declaration: "Customs Declaration",
  invoice: "Invoice",
  packing_list: "Packing List",
  certificate_of_origin: "Certificate of Origin",
  delivery_order: "Delivery Order",
  other: "Other",
};

const CATEGORIES = [
  { key: "all", label: "All Documents" },
  { key: "shipping", label: "Shipping", types: ["bill_of_lading", "packing_list", "delivery_order"] },
  { key: "customs", label: "Customs", types: ["customs_declaration", "certificate_of_origin"] },
  { key: "financial", label: "Financial", types: ["invoice"] },
  { key: "sop", label: "SOPs", types: ["sop"] },
  { key: "other", label: "Other", types: ["other"] },
];

export default function ClientDocuments() {
  const { clientProfile } = useClientAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("other");
  const [uploadName, setUploadName] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // New Shipment Documents (BOL, Packing List, Commercial Invoice)
  const [shipmentRef, setShipmentRef] = useState("");
  const [bolFile, setBolFile] = useState<File | null>(null);
  const [packingFile, setPackingFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [shipmentNotes, setShipmentNotes] = useState("");
  const [submittingShipment, setSubmittingShipment] = useState(false);
  const bolRef = useRef<HTMLInputElement>(null);
  const packingRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!clientProfile) return;
    setLoading(true);
    const { data } = await supabase
      .from("client_documents")
      .select("*")
      .eq("customer_id", clientProfile.customer_id)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientProfile]);

  const filtered = documents.filter(d => {
    const matchesSearch = d.document_name.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase());
    const category = CATEGORIES.find(c => c.key === activeCategory);
    const matchesCategory = activeCategory === "all" || (category?.types?.includes(d.document_type));
    return matchesSearch && matchesCategory;
  });

  const handleUpload = async () => {
    if (!clientProfile || !uploadFile) {
      toast.error("Please choose a file to share");
      return;
    }
    if (uploadFile.size > 20 * 1024 * 1024) {
      toast.error("File must be 20MB or smaller");
      return;
    }
    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop();
      const path = `${clientProfile.customer_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("client-documents")
        .upload(path, uploadFile, { contentType: uploadFile.type, upsert: false });
      if (upErr) throw upErr;

      const sizeKb = Math.round(uploadFile.size / 1024);
      const { error: insErr } = await supabase.from("client_documents").insert({
        customer_id: clientProfile.customer_id,
        document_name: uploadName.trim() || uploadFile.name,
        document_type: uploadType,
        file_url: path,
        file_size: sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
        notes: uploadNotes.trim() || null,
        status: "active",
      });
      if (insErr) throw insErr;

      toast.success("Document shared with our team");
      setUploadFile(null);
      setUploadName("");
      setUploadNotes("");
      setUploadType("other");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocs();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadOne = async (file: File, docType: string, label: string) => {
    const ext = file.name.split(".").pop();
    const path = `${clientProfile!.customer_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("client-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;
    const sizeKb = Math.round(file.size / 1024);
    const docName = shipmentRef.trim()
      ? `${label} - ${shipmentRef.trim()}`
      : `${label} - ${file.name}`;
    const { error: insErr } = await supabase.from("client_documents").insert({
      customer_id: clientProfile!.customer_id,
      document_name: docName,
      document_type: docType,
      file_url: path,
      file_size: sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
      notes: shipmentNotes.trim() || null,
      status: "active",
    });
    if (insErr) throw insErr;
  };

  const handleSubmitShipmentDocs = async () => {
    if (!clientProfile) return;
    const items: Array<[File | null, string, string]> = [
      [bolFile, "bill_of_lading", "Bill of Lading"],
      [packingFile, "packing_list", "Packing List"],
      [invoiceFile, "invoice", "Commercial Invoice"],
    ];
    const queued = items.filter(([f]) => !!f);
    if (queued.length === 0) {
      toast.error("Attach at least one document");
      return;
    }
    for (const [f] of queued) {
      if (f && f.size > 20 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 20MB`);
        return;
      }
    }
    setSubmittingShipment(true);
    try {
      for (const [f, t, l] of queued) {
        if (f) await uploadOne(f, t, l);
      }
      toast.success(`${queued.length} document(s) submitted to our team`);
      setShipmentRef("");
      setShipmentNotes("");
      setBolFile(null);
      setPackingFile(null);
      setInvoiceFile(null);
      if (bolRef.current) bolRef.current.value = "";
      if (packingRef.current) packingRef.current.value = "";
      if (invoiceRef.current) invoiceRef.current.value = "";
      fetchDocs();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Submission failed");
    } finally {
      setSubmittingShipment(false);
    }
  };

  const handleDownload = async (doc: any) => {
    if (!doc.file_url) return;
    const { data } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_url, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Failed to download document");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Completed Job Documents
        </h1>
        <p className="text-muted-foreground text-sm">
          Documents shared by our team for your completed jobs and SOPs

        </p>
      </div>

      {/* Share Documents */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-primary" /> Share Documents With Us
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Upload new documents you'd like our team to work on (max 20MB per file).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="upload-file" className="text-xs">File</Label>
              <Input
                id="upload-file"
                ref={fileInputRef}
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="upload-type" className="text-xs">Document type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger id="upload-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UPLOAD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upload-name" className="text-xs">Document name (optional)</Label>
            <Input
              id="upload-name"
              placeholder="e.g. Invoice for Shipment #1234"
              value={uploadName}
              maxLength={150}
              onChange={(e) => setUploadName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upload-notes" className="text-xs">Notes for our team (optional)</Label>
            <Textarea
              id="upload-notes"
              placeholder="Add any context or instructions..."
              value={uploadNotes}
              maxLength={1000}
              rows={2}
              onChange={(e) => setUploadNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={uploading || !uploadFile} className="gap-2">
              <Send className="h-4 w-4" />
              {uploading ? "Sharing..." : "Share Document"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Shipment Documents */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-5 w-5 text-primary" /> Submit New Shipment Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Attach the Bill of Lading, Packing List and Commercial Invoice for a new shipment (max 20MB each).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="shipment-ref" className="text-xs">Shipment reference (optional)</Label>
            <Input
              id="shipment-ref"
              placeholder="e.g. PO-2026-0042 or Booking #ABC123"
              value={shipmentRef}
              maxLength={100}
              onChange={(e) => setShipmentRef(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="bol-file" className="text-xs">Bill of Lading</Label>
              <Input id="bol-file" ref={bolRef} type="file"
                onChange={(e) => setBolFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="packing-file" className="text-xs">Packing List</Label>
              <Input id="packing-file" ref={packingRef} type="file"
                onChange={(e) => setPackingFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-file" className="text-xs">Commercial Invoice</Label>
              <Input id="invoice-file" ref={invoiceRef} type="file"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shipment-notes" className="text-xs">Notes for our team (optional)</Label>
            <Textarea id="shipment-notes" placeholder="Any special instructions for this shipment..."
              value={shipmentNotes} maxLength={1000} rows={2}
              onChange={(e) => setShipmentNotes(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmitShipmentDocs}
              disabled={submittingShipment || (!bolFile && !packingFile && !invoiceFile)}
              className="gap-2">
              <Send className="h-4 w-4" />
              {submittingShipment ? "Submitting..." : "Submit Shipment Documents"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents from SLAC for completed jobs */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold">Documents from SLAC</h2>
        <p className="text-xs text-muted-foreground">Files our team has shared with you for completed jobs.</p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
              {cat.label}
              {cat.key !== "all" && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                  {documents.filter(d => cat.types?.includes(d.document_type)).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      d.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {d.document_type === "sop" ? <FileCheck className="h-5 w-5" /> : <File className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.document_name}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {TYPE_LABELS[d.document_type] || d.document_type}
                      </Badge>
                    </div>
                  </div>
                  {d.file_url && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(d)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(d)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    {d.file_size && <span>{d.file_size}</span>}
                    <Badge className={cn("border-0 text-[10px]",
                      d.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      d.status === "expired" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {d.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
