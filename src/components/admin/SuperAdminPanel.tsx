import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Database, UserX, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["super_admin", "admin", "manager", "staff"] as const;

const DATA_TABLES: { value: string; label: string }[] = [
  { value: "consignment_workflows", label: "Consignments" },
  { value: "client_shipments", label: "Client Shipments" },
  { value: "customers", label: "Customers" },
  { value: "trucking_trips", label: "Trucking Trips" },
  { value: "trucks", label: "Trucks" },
  { value: "drivers", label: "Drivers" },
  { value: "finance_invoices", label: "Invoices" },
  { value: "finance_expenses", label: "Expenses" },
  { value: "finance_payments", label: "Payments" },
  { value: "vouchers", label: "Vouchers" },
  { value: "client_invoices", label: "Client Invoices" },
  { value: "consolidations", label: "Consolidations" },
  { value: "client_documents", label: "Client Documents" },
  { value: "consignment_documents", label: "Consignment Documents" },
  { value: "notifications", label: "Notifications" },
  { value: "chat_messages", label: "Chat Messages" },
];

const LABEL_KEYS = ["consignment_ref", "invoice_number", "voucher_no", "expense_ref", "bl_number", "company_name",
  "name", "full_name", "truck_number", "driver_name", "title", "document_name", "file_name", "customer", "client_name", "content", "message"];

const rowLabel = (r: any) => {
  const parts = LABEL_KEYS.filter((k) => r[k]).slice(0, 2).map((k) => String(r[k]).slice(0, 60));
  if (r.origin || r.destination) parts.push(`${r.origin ?? "?"} → ${r.destination ?? "?"}`);
  if (r.status) parts.push(`[${r.status}]`);
  return parts.length ? parts.join(" — ") : r.id;
};

async function callAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("super-admin-actions", { body });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

interface Props { users: any[]; currentUserId?: string; onChanged: () => void; onRoleChange: (id: string, role: string) => void; }

export default function SuperAdminPanel({ users, currentUserId, onChanged, onRoleChange }: Props) {
  const [userSearch, setUserSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [table, setTable] = useState(DATA_TABLES[0].value);
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dataSearch, setDataSearch] = useState("");
  const [confirmData, setConfirmData] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadRows = async () => {
    setSelected(new Set());
    const { data, error } = await supabase.from(table as any).select("*").order("created_at", { ascending: false }).limit(200);
    if (error) { toast.error(error.message); setRows([]); return; }
    setRows(data || []);
  };
  useEffect(() => { loadRows(); /* eslint-disable-next-line */ }, [table]);

  const filteredUsers = users.filter((u) =>
    `${u.full_name} ${u.email} ${u.staff_id}`.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredRows = rows.filter((r) => rowLabel(r).toLowerCase().includes(dataSearch.toLowerCase()));

  const deleteUser = async () => {
    if (!confirmUser) return;
    setBusy(true);
    try {
      await callAction({ action: "delete_user", user_id: confirmUser.user_id });
      toast.success(`${confirmUser.full_name || confirmUser.email} deleted`);
      onChanged();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false); setConfirmUser(null);
  };

  const deleteRecords = async () => {
    setBusy(true);
    try {
      const res = await callAction({ action: "delete_records", table, ids: [...selected] });
      toast.success(`${res.deleted ?? selected.size} record(s) deleted`);
      loadRows();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false); setConfirmData(false);
  };

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.id));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base flex items-center gap-2"><UserX className="h-4 w-4" /> User accounts & roles</CardTitle>
          <Input placeholder="Search users…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="max-w-xs h-8" />
        </CardHeader>
        <CardContent className="max-h-[420px] overflow-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Delete</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role || "staff"} onValueChange={(v) => onRoleChange(u.user_id, v)}>
                      <SelectTrigger className="h-8 w-[140px] capitalize"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled={u.user_id === currentUserId} title={u.user_id === currentUserId ? "You can't delete yourself" : "Delete account"} onClick={() => setConfirmUser(u)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Delete data</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={table} onValueChange={setTable}>
              <SelectTrigger className="h-8 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{DATA_TABLES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Filter…" value={dataSearch} onChange={(e) => setDataSearch(e.target.value)} className="w-40 h-8" />
            <Button variant="outline" size="sm" onClick={loadRows}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm" disabled={!selected.size} onClick={() => setConfirmData(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete ({selected.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={(c) => setSelected(c ? new Set(filteredRows.map((r) => r.id)) : new Set())} /></TableHead>
              <TableHead>Record</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filteredRows.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
              {filteredRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} /></TableCell>
                  <TableCell className="text-sm">{rowLabel(r)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-2">Showing the latest 200 records.</p>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmUser} onOpenChange={(o) => !o && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account permanently?</AlertDialogTitle>
            <AlertDialogDescription>{confirmUser?.full_name} ({confirmUser?.email}) will lose all access. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); deleteUser(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmData} onOpenChange={setConfirmData}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} record(s)?</AlertDialogTitle>
            <AlertDialogDescription>These records will be removed permanently. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); deleteRecords(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
