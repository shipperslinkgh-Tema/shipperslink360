import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, Search, Eye, Calendar, CreditCard,
  AlertTriangle, CheckCircle, Clock, Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle },
  partial: { label: "Partial", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CreditCard },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: Clock },
};

export default function ClientInvoices() {
  const { clientProfile } = useClientAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

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

  const totalOwed = invoices
    .filter(i => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount || 0)), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Invoices & Payments
        </h1>
        <p className="text-muted-foreground text-sm">View your billing history and payment status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold text-foreground">GHS {totalOwed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600">GHS {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue Invoices</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
              {overdueCount > 0 && <AlertTriangle className="h-6 w-6 text-destructive opacity-70" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
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
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(i => {
                  const balance = Number(i.amount) - Number(i.paid_amount || 0);
                  const cfg = STATUS_CONFIG[i.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={i.id} className="cursor-pointer" onClick={() => setSelectedInvoice(i)}>
                      <TableCell className="font-mono text-sm font-medium">{i.invoice_number}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{i.description || "—"}</TableCell>
                      <TableCell className="text-right font-medium">{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-emerald-600">{i.currency} {Number(i.paid_amount || 0).toLocaleString()}</TableCell>
                      <TableCell className={cn("text-right font-medium", balance > 0 ? "text-destructive" : "")}>
                        {i.currency} {balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1 border-0", cfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(i.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          {selectedInvoice && <InvoiceDetail invoice={selectedInvoice} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoiceDetail({ invoice }: { invoice: any }) {
  const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
  const balance = Number(invoice.amount) - Number(invoice.paid_amount || 0);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {invoice.invoice_number}
          </DialogTitle>
          <Badge className={cn("gap-1 border-0", cfg.color)}>
            <cfg.icon className="h-3 w-3" />
            {cfg.label}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {invoice.description && (
          <p className="text-sm text-muted-foreground">{invoice.description}</p>
        )}

        {/* Amount Breakdown */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Amount</span>
              <span className="font-medium">{invoice.currency} {Number(invoice.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-emerald-600">{invoice.currency} {Number(invoice.paid_amount || 0).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-bold">
              <span>Balance Due</span>
              <span className={balance > 0 ? "text-destructive" : "text-emerald-600"}>
                {invoice.currency} {balance.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Issue Date</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className={cn("text-sm font-medium flex items-center gap-1",
              invoice.status === "overdue" ? "text-destructive" : ""
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>
          {invoice.paid_date && (
            <div>
              <p className="text-xs text-muted-foreground">Paid Date</p>
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {new Date(invoice.paid_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {balance > 0 && invoice.status !== "cancelled" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Payment Instructions</p>
              <p className="text-sm">Please contact SLAC Accounts for payment details and confirmation.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
