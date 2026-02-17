import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Shield, Users, Lock, Unlock, Globe, Copy } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEPARTMENTS = [
  "operations", "documentation", "accounts", "marketing",
  "customer_service", "warehouse", "management", "super_admin",
] as const;

const ROLES = ["super_admin", "admin", "manager", "staff"] as const;

const DEPT_LABELS: Record<string, string> = {
  operations: "Operations",
  documentation: "Documentation",
  accounts: "Accounts",
  marketing: "Marketing",
  customer_service: "Customer Service",
  warehouse: "Warehouse",
  management: "Management",
  super_admin: "Super Admin",
};

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", staff_id: "", department: "operations" as string,
    role: "staff" as string, email: "", phone: "", username: "", password: "",
  });
  const [clientForm, setClientForm] = useState({
    customer_id: "", company_name: "", contact_name: "", email: "", phone: "", password: "",
  });

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); fetchClients(); }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("client_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setClients(data || []);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("admin-create-user", {
        body: form,
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast.success(`User ${form.full_name} created successfully`);
      setOpen(false);
      setForm({ full_name: "", staff_id: "", department: "operations", role: "staff", email: "", phone: "", username: "", password: "" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    }
    setLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("admin-create-client", { body: clientForm });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Client account for ${clientForm.company_name} created`);
      setClientOpen(false);
      setClientForm({ customer_id: "", company_name: "", contact_name: "", email: "", phone: "", password: "" });
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    }
    setLoading(false);
  };

  const toggleLock = async (userId: string, isLocked: boolean) => {
    await supabase.from("profiles").update({
      is_locked: !isLocked,
      failed_login_attempts: !isLocked ? 5 : 0,
      locked_at: !isLocked ? new Date().toISOString() : null,
    }).eq("user_id", userId);
    fetchUsers();
    toast.success(isLocked ? "User unlocked" : "User locked");
  };

  const portalUrl = `${window.location.origin}/portal/login`;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground text-sm">Create and manage staff & client accounts</p>
        </div>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff" className="gap-2"><Users className="h-4 w-4" /> Staff</TabsTrigger>
          <TabsTrigger value="clients" className="gap-2"><Globe className="h-4 w-4" /> Client Portal</TabsTrigger>
        </TabsList>

        {/* STAFF TAB */}
        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" /> Create Staff User</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create New Staff User</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Staff ID *</Label><Input value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} required placeholder="SL-001" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Department *</Label><Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{DEPT_LABELS[d]}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Role *</Label><Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Username *</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Temporary Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} /></div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create User Account"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Staff Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead><TableHead>Full Name</TableHead><TableHead>Department</TableHead>
                    <TableHead>Role</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No users created yet.</TableCell></TableRow>
                  ) : users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-sm">{u.staff_id}</TableCell>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{DEPT_LABELS[u.department] || u.department}</Badge></TableCell>
                      <TableCell className="capitalize">{u.user_roles?.[0]?.role?.replace("_", " ") || "—"}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        {u.is_locked ? <Badge variant="destructive">Locked</Badge> : u.is_active ? <Badge className="bg-success/10 text-success border-0">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleLock(u.user_id, u.is_locked)}>
                          {u.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIENT PORTAL TAB */}
        <TabsContent value="clients" className="space-y-4">
          {/* Portal Link */}
          <Card>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Client Portal Link</p>
                <p className="text-xs text-muted-foreground">Share this link with clients for portal access</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-3 py-1.5 rounded">{portalUrl}</code>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Link copied!"); }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Dialog open={clientOpen} onOpenChange={setClientOpen}>
              <DialogTrigger asChild>
                <Button><Globe className="mr-2 h-4 w-4" /> Create Client Account</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Client Portal Account</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Customer ID *</Label><Input value={clientForm.customer_id} onChange={e => setClientForm(f => ({ ...f, customer_id: e.target.value }))} required placeholder="CUST-001" /></div>
                    <div className="space-y-1.5"><Label>Company Name *</Label><Input value={clientForm.company_name} onChange={e => setClientForm(f => ({ ...f, company_name: e.target.value }))} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Contact Name *</Label><Input value={clientForm.contact_name} onChange={e => setClientForm(f => ({ ...f, contact_name: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Phone</Label><Input value={clientForm.phone} onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Temporary Password *</Label><Input type="password" value={clientForm.password} onChange={e => setClientForm(f => ({ ...f, password: e.target.value }))} required minLength={8} /></div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Client Account"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> Client Accounts</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead><TableHead>Company</TableHead><TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No client accounts yet.</TableCell></TableRow>
                  ) : clients.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.customer_id}</TableCell>
                      <TableCell className="font-medium">{c.company_name}</TableCell>
                      <TableCell>{c.contact_name}</TableCell>
                      <TableCell className="text-sm">{c.email}</TableCell>
                      <TableCell>
                        {c.is_active ? <Badge className="bg-success/10 text-success border-0">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.last_login_at ? new Date(c.last_login_at).toLocaleDateString() : "Never"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
