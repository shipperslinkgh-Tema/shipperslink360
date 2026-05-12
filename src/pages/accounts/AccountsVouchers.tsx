import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import { useVouchers } from "@/hooks/useVouchers";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";
import { VOUCHER_TYPE_LABEL, type Voucher, type VoucherType } from "@/types/accounts";
import VoucherDialog from "./VoucherDialog";

const statusColor = (s: string) =>
  s === "posted" ? "bg-success/15 text-success border-success/30" :
  s === "cancelled" ? "bg-destructive/15 text-destructive border-destructive/30" :
  "bg-muted text-muted-foreground";

export default function AccountsVouchers() {
  const { canEdit } = useAccountsAccess();
  const [type, setType] = useState<VoucherType | "all">("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openType, setOpenType] = useState<VoucherType | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: vouchers = [], isLoading } = useVouchers({
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  });

  const { data: consignments = [] } = useQuery({
    queryKey: ["consignment_options"],
    queryFn: async () => {
      const { data } = await supabase.from("consignment_workflows").select("id, consignment_ref, client_name").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customer_options"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, company_name, customer_code").order("company_name").limit(500);
      return data ?? [];
    },
  });

  const filtered = vouchers.filter((v: Voucher) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (v.voucher_no ?? "").toLowerCase().includes(s) ||
           (v.party_name ?? "").toLowerCase().includes(s) ||
           (v.reference ?? "").toLowerCase().includes(s) ||
           (v.narration ?? "").toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search voucher no, payee, reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="payment">Payment Vouchers</SelectItem>
              <SelectItem value="receipt">Receipt Vouchers</SelectItem>
              <SelectItem value="journal">Journal Vouchers</SelectItem>
              <SelectItem value="contra">Contra Vouchers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {canEdit && (
            <div className="ml-auto flex gap-2">
              <Button size="sm" onClick={() => setOpenType("payment")}><Plus className="h-4 w-4 mr-1" />Payment</Button>
              <Button size="sm" variant="secondary" onClick={() => setOpenType("receipt")}><Plus className="h-4 w-4 mr-1" />Receipt</Button>
              <Button size="sm" variant="outline" onClick={() => setOpenType("journal")}><Plus className="h-4 w-4 mr-1" />Journal</Button>
              <Button size="sm" variant="outline" onClick={() => setOpenType("contra")}><Plus className="h-4 w-4 mr-1" />Contra</Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3">Voucher No.</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payee / Customer</th>
                <th className="p-3">Reference</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No vouchers found.</td></tr>}
              {filtered.map((v: Voucher) => (
                <tr key={v.id} className="border-t hover:bg-muted/40">
                  <td className="p-3 font-mono">{v.voucher_no}</td>
                  <td className="p-3">{VOUCHER_TYPE_LABEL[v.voucher_type]}</td>
                  <td className="p-3">{v.voucher_date}</td>
                  <td className="p-3">{v.party_name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{v.reference ?? "—"}</td>
                  <td className="p-3 text-right font-medium">{v.currency} {Number(v.total_amount).toLocaleString()}</td>
                  <td className="p-3"><Badge variant="outline" className={statusColor(v.status)}>{v.status}</Badge></td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setOpenType(v.voucher_type); setEditId(v.id); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {openType && (
        <VoucherDialog
          open={!!openType}
          onOpenChange={(o) => { if (!o) { setOpenType(null); setEditId(null); } }}
          type={openType}
          voucherId={editId}
          consignments={consignments as any}
          customers={customers as any}
        />
      )}
    </div>
  );
}
