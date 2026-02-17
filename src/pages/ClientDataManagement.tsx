import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, DollarSign, Search, Plus, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SHIPMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_transit", label: "In Transit" },
  { value: "at_port", label: "At Port" },
  { value: "customs_clearance", label: "Customs Clearance" },
  { value: "delivered", label: "Delivered" },
  { value: "on_hold", label: "On Hold" },
];

const INVOICE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "partial", label: "Partial" },
  { value: "cancelled", label: "Cancelled" },
];

const CURRENCIES = ["GHS", "USD", "EUR", "GBP", "CNY"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_transit: "bg-primary/10 text-primary",
  at_port: "bg-warning/10 text-warning",
  customs_clearance: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  on_hold: "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  partial: "bg-info/10 text-info",
  cancelled: "bg-muted text-muted-foreground",
};

const emptyShipment = {
  customer_id: "", bl_number: "", container_number: "", vessel_name: "",
  voyage_number: "", origin: "", destination: "", cargo_description: "",
  status: "pending", eta: "", weight_kg: "",
};

const emptyInvoice = {
  customer_id: "", invoice_number: "", description: "", amount: "",
  currency: "GHS", status: "pending", due_date: "", paid_amount: "0",
};

export default function ClientDataManagement() {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [search, setSearch] = useState("");

  // Shipments
  const [shipments, setShipments] = useState<any[]>([]);
  const [shipLoading, setShipLoading] = useState(true);
  const [shipOpen, setShipOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any>(null);
  const [shipForm, setShipForm] = useState({ ...emptyShipment });
  const [shipSaving, setShipSaving] = useState(false);

  // Invoices
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invOpen, setInvOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [invForm, setInvForm] = useState({ ...emptyInvoice });
  const [invSaving, setInvSaving] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchShipments();
    fetchInvoices();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from("client_profiles").select("customer_id, company_name").order("company_name");
    setClients(data || []);
  };

  const fetchShipments = async () => {
    const { data } = await supabase.from("client_shipments").select("*").order("created_at", { ascending: false });
    setShipments(data || []);
    setShipLoading(false);
  };

  const fetchInvoices = async () => {
    const { data } = await supabase.from("client_invoices").select("*").order("created_at", { ascending: false });
    setInvoices(data || []);
    setInvLoading(false);
  };

  // --- Shipment CRUD ---
  const openNewShipment = () => {
    setEditingShipment(null);
    setShipForm({ ...emptyShipment });
    setShipOpen(true);
  };

  const openEditShipment = (s: any) => {
    setEditingShipment(s);
    setShipForm({
      customer_id: s.customer_id,
      bl_number: s.bl_number,
      container_number: s.container_number || "",
      vessel_name: s.vessel_name || "",
      voyage_number: s.voyage_number || "",
      origin: s.origin,
      destination: s.destination,
      cargo_description: s.cargo_description || "",
      status: s.status,
      eta: s.eta ? s.eta.slice(0, 10) : "",
      weight_kg: s.weight_kg ? String(s.weight_kg) : "",
    });
    setShipOpen(true);
  };

  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setShipSaving(true);
    try {
      const payload = {
        customer_id: shipForm.customer_id,
        bl_number: shipForm.bl_number,
        container_number: shipForm.container_number || null,
        vessel_name: shipForm.vessel_name || null,
        voyage_number: shipForm.voyage_number || null,
        origin: shipForm.origin,
        destination: shipForm.destination,
        cargo_description: shipForm.cargo_description || null,
        status: shipForm.status,
        eta: shipForm.eta || null,
        weight_kg: shipForm.weight_kg ? Number(shipForm.weight_kg) : null,
      };

      if (editingShipment) {
        const { error } = await supabase.from("client_shipments").update(payload).eq("id", editingShipment.id);
        if (error) throw error;
        toast.success("Shipment updated");
      } else {
        const { error } = await supabase.from("client_shipments").insert(payload);
        if (error) throw error;
        toast.success("Shipment created");
      }
      setShipOpen(false);
      fetchShipments();
    } catch (err: any) {
      toast.error(err.message || "Failed to save shipment");
    }
    setShipSaving(false);
  };

  // --- Invoice CRUD ---
  const openNewInvoice = () => {
    setEditingInvoice(null);
    setInvForm({ ...emptyInvoice });
    setInvOpen(true);
  };

  const openEditInvoice = (inv: any) => {
    setEditingInvoice(inv);
    setInvForm({
      customer_id: inv.customer_id,
      invoice_number: inv.invoice_number,
      description: inv.description || "",
      amount: String(inv.amount),
      currency: inv.currency,
      status: inv.status,
      due_date: inv.due_date,
      paid_amount: String(inv.paid_amount || 0),
    });
    setInvOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvSaving(true);
    try {
      const payload = {
        customer_id: invForm.customer_id,
        invoice_number: invForm.invoice_number,
        description: invForm.description || null,
        amount: Number(invForm.amount),
        currency: invForm.currency,
        status: invForm.status,
        due_date: invForm.due_date,
        paid_amount: Number(invForm.paid_amount || 0),
      };

      if (editingInvoice) {
        const { error } = await supabase.from("client_invoices").update(payload).eq("id", editingInvoice.id);
        if (error) throw error;
        toast.success("Invoice updated");
      } else {
        const { error } = await supabase.from("client_invoices").insert(payload);
        if (error) throw error;
        toast.success("Invoice created");
      }
      setInvOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save invoice");
    }
    setInvSaving(false);
  };

  // Filtering
  const filteredShipments = shipments.filter(s => {
    const matchSearch = s.bl_number.toLowerCase().includes(search.toLowerCase()) ||
      (s.container_number || "").toLowerCase().includes(search.toLowerCase());
    const matchCustomer = filterCustomer === "all" || s.customer_id === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const filteredInvoices = invoices.filter(i => {
    const matchSearch = i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCustomer = filterCustomer === "all" || i.customer_id === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const getClientName = (custId: string) => clients.find(c => c.customer_id === custId)?.company_name || custId;

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Access restricted to administrators.</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Client Data Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage shipments & invoices visible to clients. <Link to="/admin/client-documents" className="text-primary underline">Manage Documents →</Link>
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="shipments">
        <TabsList>
          <TabsTrigger value="shipments" className="gap-2"><Ship className="h-4 w-4" /> Shipments ({filteredShipments.length})</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2"><DollarSign className="h-4 w-4" /> Invoices ({filteredInvoices.length})</TabsTrigger>
        </TabsList>

        {/* SHIPMENTS TAB */}
        <TabsContent value="shipments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={shipOpen} onOpenChange={setShipOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewShipment}><Plus className="mr-2 h-4 w-4" /> Add Shipment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>{editingShipment ? "Edit Shipment" : "Add Client Shipment"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSaveShipment} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Client *</Label>
                      <Select value={shipForm.customer_id} onValueChange={v => setShipForm(f => ({ ...f, customer_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.company_name} ({c.customer_id})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>BL Number *</Label><Input value={shipForm.bl_number} onChange={e => setShipForm(f => ({ ...f, bl_number: e.target.value }))} required /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5"><Label>Container #</Label><Input value={shipForm.container_number} onChange={e => setShipForm(f => ({ ...f, container_number: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Vessel Name</Label><Input value={shipForm.vessel_name} onChange={e => setShipForm(f => ({ ...f, vessel_name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Voyage #</Label><Input value={shipForm.voyage_number} onChange={e => setShipForm(f => ({ ...f, voyage_number: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Origin *</Label><Input value={shipForm.origin} onChange={e => setShipForm(f => ({ ...f, origin: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Destination *</Label><Input value={shipForm.destination} onChange={e => setShipForm(f => ({ ...f, destination: e.target.value }))} required /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={shipForm.status} onValueChange={v => setShipForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{SHIPMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>ETA</Label><Input type="date" value={shipForm.eta} onChange={e => setShipForm(f => ({ ...f, eta: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Weight (kg)</Label><Input type="number" value={shipForm.weight_kg} onChange={e => setShipForm(f => ({ ...f, weight_kg: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Cargo Description</Label><Textarea value={shipForm.cargo_description} onChange={e => setShipForm(f => ({ ...f, cargo_description: e.target.value }))} rows={2} /></div>
                  <Button type="submit" className="w-full" disabled={shipSaving || !shipForm.customer_id || !shipForm.bl_number}>
                    {shipSaving ? "Saving..." : editingShipment ? "Update Shipment" : "Create Shipment"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {shipLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading shipments...</div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No shipments found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>BL Number</TableHead>
                      <TableHead>Container</TableHead>
                      <TableHead>Vessel</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{getClientName(s.customer_id)}</TableCell>
                        <TableCell className="font-mono text-sm font-medium">{s.bl_number}</TableCell>
                        <TableCell className="font-mono text-sm">{s.container_number || "—"}</TableCell>
                        <TableCell className="text-sm">{s.vessel_name || "—"}</TableCell>
                        <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[s.status] || ""} border-0 capitalize`}>{s.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{s.eta ? new Date(s.eta).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEditShipment(s)}><Pencil className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={invOpen} onOpenChange={setInvOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewInvoice}><Plus className="mr-2 h-4 w-4" /> Add Invoice</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingInvoice ? "Edit Invoice" : "Add Client Invoice"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSaveInvoice} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Client *</Label>
                      <Select value={invForm.customer_id} onValueChange={v => setInvForm(f => ({ ...f, customer_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.company_name} ({c.customer_id})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Invoice Number *</Label><Input value={invForm.invoice_number} onChange={e => setInvForm(f => ({ ...f, invoice_number: e.target.value }))} required placeholder="INV-001" /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Description</Label><Input value={invForm.description} onChange={e => setInvForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Currency</Label>
                      <Select value={invForm.currency} onValueChange={v => setInvForm(f => ({ ...f, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Amount *</Label><Input type="number" step="0.01" value={invForm.amount} onChange={e => setInvForm(f => ({ ...f, amount: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Paid Amount</Label><Input type="number" step="0.01" value={invForm.paid_amount} onChange={e => setInvForm(f => ({ ...f, paid_amount: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={invForm.status} onValueChange={v => setInvForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{INVOICE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Due Date *</Label><Input type="date" value={invForm.due_date} onChange={e => setInvForm(f => ({ ...f, due_date: e.target.value }))} required /></div>
                  </div>
                  <Button type="submit" className="w-full" disabled={invSaving || !invForm.customer_id || !invForm.invoice_number}>
                    {invSaving ? "Saving..." : editingInvoice ? "Update Invoice" : "Create Invoice"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {invLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No invoices found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(i => (
                      <TableRow key={i.id}>
                        <TableCell className="text-sm">{getClientName(i.customer_id)}</TableCell>
                        <TableCell className="font-mono text-sm font-medium">{i.invoice_number}</TableCell>
                        <TableCell className="text-sm">{i.description || "—"}</TableCell>
                        <TableCell className="font-medium">{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                        <TableCell>{i.currency} {Number(i.paid_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[i.status] || ""} border-0 capitalize`}>{i.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(i.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEditInvoice(i)}><Pencil className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
