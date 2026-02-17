import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  partial: "bg-info/10 text-info",
  cancelled: "bg-muted text-muted-foreground",
};

export default function ClientInvoices() {
  const { clientProfile } = useClientAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientProfile) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("client_invoices")
        .select("*")
        .eq("customer_id", clientProfile.customer_id)
        .order("created_at", { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    };
    fetch();
  }, [clientProfile]);

  const filtered = invoices.filter(i =>
    i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalOwed = invoices.filter(i => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount || 0)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6 text-warning" /> Invoices & Payments</h1>
          <p className="text-muted-foreground text-sm">View your billing history and payment status</p>
        </div>
        <Card className="px-4 py-2">
          <p className="text-xs text-muted-foreground">Outstanding Balance</p>
          <p className="text-xl font-bold text-foreground">GHS {totalOwed.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No invoices found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-sm font-medium">{i.invoice_number}</TableCell>
                    <TableCell>{i.description || "—"}</TableCell>
                    <TableCell className="font-medium">{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                    <TableCell>{i.currency} {Number(i.paid_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[i.status] || ""} border-0 capitalize`}>{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(i.due_date).toLocaleDateString()}</TableCell>
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
