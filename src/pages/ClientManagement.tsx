import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Users, Search, Plus, Pencil, FileText, Upload, Trash2, Download,
  DollarSign, Receipt, CreditCard, Building2, Mail, Phone, Hash, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DOC_TYPES = [
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "bill_of_lading", label: "Bill of Lading (BL)" },
  { value: "customs_declaration", label: "Customs Entry (BOE)" },
  { value: "delivery_order", label: "Delivery Order" },
  { value: "idf", label: "IDF" },
  { value: "other", label: "Other" },
];
const TYPE_LABELS: Record<string, string> = Object.fromEntries(DOC_TYPES.map(d => [d.value, d.label]));

const INV_STATUS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  partially_paid: "bg-blue-100 text-blue-800",
  cancelled: "bg-muted text-muted-foreground",
};
const PAY_METHODS = ["bank_transfer", "cash", "cheque", "mobile_money", "card", "other"];
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export default function ClientManagement() {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("client_profiles")
      .select("*")
      .order("company_name");
    setClients(data || []);
    setLoading(false);
    if (!selectedId && data?.length) setSelectedId(data[0].id);
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = useMemo(() => clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.company_name?.toLowerCase().includes(q)
      || c.customer_id?.toLowerCase().includes(q)
      || c.email?.toLowerCase().includes(q)
      || c.tin_number?.toLowerCase().includes(q);
  }), [clients, search]);

  const selected = clients.find(c => c.id === selectedId);

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Access restricted to administrators.</p></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Client Management System
          </h1>
          <p className="text-muted-foreground text-sm">
            Unified client data, documents, and financial records — all changes sync to the client portal in real-time.
          </p>
        </div>
        <CreateClientDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchClients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <Card className="lg:sticky lg:top-4 lg:self-start">
          <CardHeader className="pb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} clients</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh]">
              <div className="space-y-1 p-2">
                {loading ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No clients found.</p>
                ) : filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full text-left rounded-md p-3 transition hover:bg-muted",
                      selectedId === c.id && "bg-primary/10 border border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate text-sm">{c.company_name}</div>
                      {!c.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{c.customer_id}</span>
                      <span className="truncate">{c.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selected ? (
          <ClientDetail client={selected} onChanged={fetchClients} />
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground">Select a client to manage.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

/* ---------------- Create Client ---------------- */
function CreateClientDialog({ open, onOpenChange, onCreated }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: "", company_name: "", contact_name: "", email: "", phone: "",
    password: "", tin_number: "", warehouses: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-client", {
        body: {
          ...form,
          warehouse_destinations: form.warehouses.split(",").map(s => s.trim()).filter(Boolean),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Client account created");
      onOpenChange(false);
      setForm({ customer_id: "", company_name: "", contact_name: "", email: "", phone: "", password: "", tin_number: "", warehouses: "" });
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Client</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create Client Account</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Client ID *</Label><Input value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required placeholder="e.g. CL-001" /></div>
            <div className="space-y-1.5"><Label>TIN</Label><Input value={form.tin_number} onChange={e => setForm(f => ({ ...f, tin_number: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Company Name *</Label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Contact Person *</Label><Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Initial Password *</Label><Input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} /></div>
          </div>
          <div className="space-y-1.5"><Label>Warehouse Destinations</Label><Input value={form.warehouses} onChange={e => setForm(f => ({ ...f, warehouses: e.target.value }))} placeholder="Comma-separated, e.g. Tema, Kumasi" /></div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Creating…" : "Create Client"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Client Detail (tabs) ---------------- */
function ClientDetail({ client, onChanged }: { client: any; onChanged: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> {client.company_name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{client.customer_id}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
              {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
              {client.tin_number && <span className="flex items-center gap-1">TIN: {client.tin_number}</span>}
            </div>
          </div>
          <Badge variant={client.is_active ? "default" : "outline"}>{client.is_active ? "Active" : "Inactive"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1"><Users className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="documents" className="gap-1"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
            <TabsTrigger value="financials" className="gap-1"><DollarSign className="h-4 w-4" /> Financials</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4"><ProfileTab client={client} onChanged={onChanged} /></TabsContent>
          <TabsContent value="documents" className="mt-4"><DocumentsTab client={client} /></TabsContent>
          <TabsContent value="financials" className="mt-4"><FinancialsTab client={client} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* ---------------- Profile Tab ---------------- */
function ProfileTab({ client, onChanged }: any) {
  const [form, setForm] = useState({
    company_name: client.company_name,
    contact_name: client.contact_name,
    email: client.email,
    phone: client.phone || "",
    tin_number: client.tin_number || "",
    warehouses: (client.warehouse_destinations || []).join(", "),
    is_active: client.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [consignments, setConsignments] = useState<any[]>([]);

  useEffect(() => {
    setForm({
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      phone: client.phone || "",
      tin_number: client.tin_number || "",
      warehouses: (client.warehouse_destinations || []).join(", "),
      is_active: client.is_active,
    });
    supabase.from("client_shipments")
      .select("id, bl_number, consignment_id, origin, destination, status, eta")
      .eq("customer_id", client.customer_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setConsignments(data || []));
  }, [client.id]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("client_profiles").update({
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone || null,
      tin_number: form.tin_number || null,
      warehouse_destinations: form.warehouses.split(",").map((s: string) => s.trim()).filter(Boolean),
      is_active: form.is_active,
    }).eq("id", client.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Client updated"); onChanged(); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Company Name</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>TIN Number</Label><Input value={form.tin_number} onChange={e => setForm({ ...form, tin_number: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Contact Person</Label><Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1.5 col-span-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-1.5 col-span-2"><Label>Warehouse Destinations</Label><Input value={form.warehouses} onChange={e => setForm({ ...form, warehouses: e.target.value })} placeholder="Comma-separated" /></div>
        <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Account Active</p>
            <p className="text-xs text-muted-foreground">Inactive clients cannot log in to the portal.</p>
          </div>
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
      </div>

      <Separator />
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><MapPin className="h-4 w-4" /> Linked Consignments ({consignments.length})</h4>
        {consignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No consignments linked to this client.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>BL #</TableHead><TableHead>Consignment</TableHead>
                <TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead>ETA</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {consignments.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.bl_number || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{c.consignment_id?.slice(0, 8) || "—"}</TableCell>
                    <TableCell className="text-sm">{c.origin} → {c.destination}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{(c.status || "").replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-sm">{c.eta ? new Date(c.eta).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Documents Tab ---------------- */
function DocumentsTab({ client }: { client: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterShip, setFilterShip] = useState("all");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ document_name: "", document_type: "invoice", shipment_id: "none", notes: "" });
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    const { data } = await supabase.from("client_documents")
      .select("*").eq("customer_id", client.customer_id).order("created_at", { ascending: false });
    setDocs(data || []);
  };

  const shipLabel = (s: any) =>
    s?.consignment_ref || s?.bl_number || (s?.id ? `CONS-${s.id.slice(0, 8).toUpperCase()}` : "—");

  useEffect(() => {
    fetchDocs();
    (async () => {
      const { data: ships } = await supabase.from("client_shipments")
        .select("id, bl_number, consignment_id")
        .eq("customer_id", client.customer_id);
      const list = ships || [];
      const workflowIds = list.map(s => s.consignment_id).filter(Boolean);
      let refMap: Record<string, string> = {};
      if (workflowIds.length) {
        const { data: wfs } = await supabase.from("consignment_workflows")
          .select("id, consignment_ref").in("id", workflowIds);
        refMap = Object.fromEntries((wfs || []).map(w => [w.id, w.consignment_ref]));
      }
      setShipments(list.map(s => ({ ...s, consignment_ref: refMap[s.consignment_id] })));
    })();
  }, [client.id]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { toast.error("File exceeds 20MB"); return; }
    setUploading(true);
    try {
      const path = `${client.customer_id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("client-documents").upload(path, file);
      if (upErr) throw upErr;
      const sizeKB = (file.size / 1024).toFixed(1);
      const fileSize = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeKB} KB`;
      const { error } = await supabase.from("client_documents").insert({
        customer_id: client.customer_id,
        shipment_id: form.shipment_id !== "none" ? form.shipment_id : null,
        document_name: form.document_name || file.name,
        document_type: form.document_type,
        file_url: path, file_size: fileSize,
        notes: form.notes || null, status: "active",
      });
      if (error) throw error;
      toast.success("Document uploaded — visible to client");
      setOpen(false); setFile(null);
      setForm({ document_name: "", document_type: "invoice", shipment_id: "none", notes: "" });
      if (fileRef.current) fileRef.current.value = "";
      fetchDocs();
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    setUploading(false);
  };

  const download = async (d: any) => {
    if (!d.file_url) return;
    const { data, error } = await supabase.storage.from("client-documents").createSignedUrl(d.file_url, 60);
    if (error || !data?.signedUrl) return toast.error("Failed to generate link");
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (d: any) => {
    if (!confirm(`Delete "${d.document_name}"?`)) return;
    if (d.file_url) await supabase.storage.from("client-documents").remove([d.file_url]);
    await supabase.from("client_documents").delete().eq("id", d.id);
    toast.success("Document deleted"); fetchDocs();
  };

  const filtered = docs.filter(d =>
    (filterType === "all" || d.document_type === filterType) &&
    (filterShip === "all" || d.shipment_id === filterShip)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterShip} onValueChange={setFilterShip}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consignments</SelectItem>
            {shipments.map(s => <SelectItem key={s.id} value={s.id}>{shipLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" /> Upload PDF</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Upload Document for {client.company_name}</DialogTitle></DialogHeader>
              <form onSubmit={upload} className="space-y-3 mt-2">
                <div className="space-y-1.5"><Label>Document Name</Label><Input value={form.document_name} onChange={e => setForm({ ...form, document_name: e.target.value })} placeholder="Leave blank for filename" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Type *</Label>
                    <Select value={form.document_type} onValueChange={v => setForm({ ...form, document_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Consignment</Label>
                    <Select value={form.shipment_id} onValueChange={v => setForm({ ...form, shipment_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Not linked —</SelectItem>
                        {shipments.map(s => <SelectItem key={s.id} value={s.id}>{shipLabel(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>File *</Label>
                  <Input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files?.[0] || null)} required />
                  <p className="text-xs text-muted-foreground">PDF or image, max 20MB.</p>
                </div>
                <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" disabled={uploading || !file} className="w-full">{uploading ? "Uploading…" : "Upload"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Consignment ID</TableHead>
            <TableHead>Size</TableHead><TableHead>Date</TableHead><TableHead className="w-24">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No documents.</TableCell></TableRow>
            ) : filtered.map(d => {
              const ship = shipments.find(s => s.id === d.shipment_id);
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.document_name}</TableCell>
                  <TableCell><Badge variant="secondary">{TYPE_LABELS[d.document_type] || d.document_type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{ship?.bl_number || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.file_size || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {d.file_url && <Button variant="ghost" size="sm" onClick={() => download(d)}><Download className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="sm" onClick={() => remove(d)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ---------------- Financials Tab ---------------- */
function FinancialsTab({ client }: { client: any }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [invOpen, setInvOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const reload = async () => {
    const [{ data: inv }, { data: pay }] = await Promise.all([
      supabase.from("client_invoices").select("*").eq("customer_id", client.customer_id).order("created_at", { ascending: false }),
      supabase.from("client_payments").select("*").eq("customer_id", client.customer_id).order("paid_date", { ascending: false }),
    ]);
    setInvoices(inv || []); setPayments(pay || []);
  };

  useEffect(() => {
    reload();
    supabase.from("client_shipments").select("id, bl_number")
      .eq("customer_id", client.customer_id).then(({ data }) => setShipments(data || []));
  }, [client.id]);

  const billed = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + Number(i.amount), 0);
  const paid = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const outstanding = billed - paid;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total Invoiced" value={`GHS ${billed.toLocaleString()}`} />
        <SummaryCard label="Total Paid" value={`GHS ${paid.toLocaleString()}`} valueClass="text-emerald-600" />
        <SummaryCard label="Outstanding" value={`GHS ${outstanding.toLocaleString()}`} valueClass={outstanding > 0 ? "text-destructive" : "text-emerald-600"} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1"><Receipt className="h-4 w-4" /> Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1"><CreditCard className="h-4 w-4" /> Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="statement" className="gap-1"><FileText className="h-4 w-4" /> Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <InvoiceDialog open={invOpen} onOpenChange={setInvOpen} client={client} shipments={shipments} onSaved={reload} />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Invoice #</TableHead><TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead><TableHead>Due</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices yet.</TableCell></TableRow>
                ) : invoices.map(i => {
                  const bal = Number(i.amount) - Number(i.paid_amount || 0);
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-sm">{i.invoice_number}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{i.description || "—"}</TableCell>
                      <TableCell className="text-right">{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                      <TableCell className={cn("text-right font-medium", bal > 0 ? "text-destructive" : "text-emerald-600")}>{i.currency} {bal.toLocaleString()}</TableCell>
                      <TableCell><Badge className={cn("border-0 capitalize", INV_STATUS[i.status] || INV_STATUS.pending)}>{(i.status || "pending").replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-sm">{i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <PaymentDialog open={payOpen} onOpenChange={setPayOpen} client={client} invoices={invoices} onSaved={reload} />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Invoice</TableHead><TableHead>Method</TableHead>
                <TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payments recorded.</TableCell></TableRow>
                ) : payments.map(p => {
                  const inv = invoices.find(i => i.id === p.invoice_id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{new Date(p.paid_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-sm">{inv?.invoice_number || "—"}</TableCell>
                      <TableCell className="text-sm capitalize">{p.method.replace("_", " ")}</TableCell>
                      <TableCell className="text-sm">{p.reference || "—"}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">{p.currency} {Number(p.amount).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="statement" className="mt-3">
          <StatementPanel client={client} invoices={invoices} payments={payments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ label, value, valueClass }: any) {
  return <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">{label}</p><p className={cn("text-xl font-bold mt-0.5", valueClass)}>{value}</p></CardContent></Card>;
}

function InvoiceDialog({ open, onOpenChange, client, shipments, onSaved }: any) {
  const [form, setForm] = useState({
    invoice_number: "", description: "", amount: "", currency: "GHS",
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    shipment_id: "none", status: "pending",
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("client_invoices").insert({
      customer_id: client.customer_id,
      shipment_id: form.shipment_id !== "none" ? form.shipment_id : null,
      invoice_number: form.invoice_number,
      description: form.description || null,
      amount: Number(form.amount),
      currency: form.currency,
      status: form.status,
      due_date: form.due_date,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Invoice created"); onOpenChange(false); onSaved(); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Invoice</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Invoice # *</Label><Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Currency</Label>
              <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["GHS", "USD", "EUR", "GBP", "CNY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Due Date *</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required /></div>
          </div>
          <div className="space-y-1.5"><Label>Consignment</Label>
            <Select value={form.shipment_id} onValueChange={v => setForm({ ...form, shipment_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Not linked —</SelectItem>
                {shipments.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.bl_number || s.id.slice(0, 8)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving…" : "Create Invoice"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ open, onOpenChange, client, invoices, onSaved }: any) {
  const unpaid = invoices.filter((i: any) => i.status !== "paid" && i.status !== "cancelled");
  const [form, setForm] = useState({
    invoice_id: "none", amount: "", currency: "GHS",
    method: "bank_transfer", reference: "", paid_date: new Date().toISOString().slice(0, 10), notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.invoice_id !== "none") {
      const inv = invoices.find((i: any) => i.id === form.invoice_id);
      if (inv) setForm(f => ({ ...f, currency: inv.currency, amount: String(Number(inv.amount) - Number(inv.paid_amount || 0)) }));
    }
  }, [form.invoice_id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("client_payments").insert({
      customer_id: client.customer_id,
      invoice_id: form.invoice_id !== "none" ? form.invoice_id : null,
      amount: Number(form.amount),
      currency: form.currency,
      method: form.method,
      reference: form.reference || null,
      paid_date: form.paid_date,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Payment recorded — balance updated"); onOpenChange(false); onSaved(); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Record Payment</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-3 mt-2">
          <div className="space-y-1.5"><Label>Apply to Invoice</Label>
            <Select value={form.invoice_id} onValueChange={v => setForm({ ...form, invoice_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— On account —</SelectItem>
                {unpaid.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.invoice_number} ({i.currency} {(Number(i.amount) - Number(i.paid_amount || 0)).toLocaleString()} due)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Currency</Label>
              <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["GHS", "USD", "EUR", "GBP", "CNY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Method</Label>
              <Select value={form.method} onValueChange={v => setForm({ ...form, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAY_METHODS.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.paid_date} onChange={e => setForm({ ...form, paid_date: e.target.value })} required /></div>
          </div>
          <div className="space-y-1.5"><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Bank ref / cheque #" /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving…" : "Record Payment"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatementPanel({ client, invoices, payments }: any) {
  const billed = invoices.filter((i: any) => i.status !== "cancelled").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = billed - totalPaid;

  // Build ledger
  const events: any[] = [];
  for (const i of invoices) {
    if (i.status === "cancelled") continue;
    events.push({ date: i.created_at, ref: i.invoice_number, desc: i.description || "Invoice", debit: Number(i.amount), credit: 0, currency: i.currency });
  }
  for (const p of payments) {
    const inv = invoices.find((i: any) => i.id === p.invoice_id);
    events.push({ date: p.paid_date, ref: inv?.invoice_number || "Payment", desc: `Payment (${p.method.replace("_", " ")})`, debit: 0, credit: Number(p.amount), currency: p.currency });
  }
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let run = 0;
  const ledger = events.map(e => { run += (e.debit - e.credit); return { ...e, balance: run }; });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Statement of Account", 14, 18);
    doc.setFontSize(10);
    doc.text(client.company_name, 14, 26);
    doc.text(`Customer ID: ${client.customer_id}`, 14, 32);
    if (client.tin_number) doc.text(`TIN: ${client.tin_number}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 26);

    autoTable(doc, {
      startY: 46,
      head: [["Total Invoiced", "Total Paid", "Outstanding Balance"]],
      body: [[`GHS ${billed.toLocaleString()}`, `GHS ${totalPaid.toLocaleString()}`, `GHS ${outstanding.toLocaleString()}`]],
      theme: "grid", headStyles: { fillColor: [37, 99, 235] },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 6,
      head: [["Date", "Reference", "Description", "Debit", "Credit", "Balance"]],
      body: ledger.map(l => [
        new Date(l.date).toLocaleDateString(), l.ref, l.desc,
        l.debit ? `${l.currency} ${l.debit.toLocaleString()}` : "",
        l.credit ? `${l.currency} ${l.credit.toLocaleString()}` : "",
        `${l.currency} ${l.balance.toLocaleString()}`,
      ]),
      theme: "striped", styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save(`Statement-${client.customer_id}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Statement downloaded");
  };

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Statement of Account</h3>
          <p className="text-xs text-muted-foreground">Opening balance: GHS 0.00 · As of {new Date().toLocaleDateString()}</p>
        </div>
        <Button onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
      </CardContent></Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead>
            <TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {ledger.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions.</TableCell></TableRow>
            ) : ledger.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm">{new Date(l.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono text-sm">{l.ref}</TableCell>
                <TableCell className="text-sm">{l.desc}</TableCell>
                <TableCell className="text-right">{l.debit ? `${l.currency} ${l.debit.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-right text-emerald-600">{l.credit ? `${l.currency} ${l.credit.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-right font-medium">{l.currency} {l.balance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
