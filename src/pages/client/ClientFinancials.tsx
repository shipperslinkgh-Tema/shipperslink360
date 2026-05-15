import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DollarSign, Download, Receipt, CreditCard, FileText,
  AlertTriangle, CheckCircle, Clock, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle },
  partial: { label: "Partial", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CreditCard },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: Clock },
};

export default function ClientFinancials() {
  const { clientProfile } = useClientAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    if (!clientProfile) return;
    const fetch = async () => {
      const [{ data: inv }, { data: pay }] = await Promise.all([
        supabase.from("client_invoices").select("*")
          .eq("customer_id", clientProfile.customer_id)
          .order("created_at", { ascending: false }),
        supabase.from("client_payments").select("*")
          .eq("customer_id", clientProfile.customer_id)
          .order("paid_date", { ascending: false }),
      ]);
      setInvoices(inv || []);
      setPayments(pay || []);
      setLoading(false);
    };
    fetch();
    const ch = supabase.channel("client-fin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_invoices", filter: `customer_id=eq.${clientProfile.customer_id}` }, fetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "client_payments", filter: `customer_id=eq.${clientProfile.customer_id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [clientProfile]);

  const totalBilled = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const outstanding = totalBilled - totalPaid;
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Financial Portal
        </h1>
        <p className="text-muted-foreground text-sm">Invoices, payments and statement of account</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Billed" value={`GHS ${totalBilled.toLocaleString()}`} />
        <SummaryCard label="Total Paid" value={`GHS ${totalPaid.toLocaleString()}`} valueClass="text-emerald-600" />
        <SummaryCard label="Outstanding Balance" value={`GHS ${outstanding.toLocaleString()}`} valueClass={outstanding > 0 ? "text-destructive" : "text-emerald-600"} />
        <SummaryCard label="Overdue Invoices" value={String(overdueCount)} valueClass={overdueCount > 0 ? "text-destructive" : ""} />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1"><Receipt className="h-4 w-4" /> Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
          <TabsTrigger value="statement" className="gap-1"><FileText className="h-4 w-4" /> Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center py-12 text-muted-foreground">Loading…</p>
              ) : invoices.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No invoices yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map(i => {
                      const cfg = STATUS[i.status] || STATUS.pending;
                      const StatusIcon = cfg.icon;
                      const balance = Number(i.amount) - Number(i.paid_amount || 0);
                      return (
                        <TableRow key={i.id} className="cursor-pointer" onClick={() => setSelected(i)}>
                          <TableCell className="font-mono text-sm font-medium">{i.invoice_number}</TableCell>
                          <TableCell className="max-w-[260px] truncate">{i.description || "—"}</TableCell>
                          <TableCell className="text-right">{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                          <TableCell className={cn("text-right font-medium", balance > 0 ? "text-destructive" : "text-emerald-600")}>
                            {i.currency} {balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("gap-1 border-0", cfg.color)}>
                              <StatusIcon className="h-3 w-3" /> {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(i.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); downloadInvoicePDF(i, clientProfile); }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                      <TableHead className="text-right">Invoice Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{new Date(p.paid_date || p.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{p.invoice_number}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{p.description || "—"}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {p.currency} {Number(p.paid_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{p.currency} {Number(p.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn("border-0", STATUS[p.status]?.color)}>{STATUS[p.status]?.label || p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statement" className="mt-4">
          <StatementOfAccount invoices={invoices} clientProfile={clientProfile} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && <InvoiceDetail invoice={selected} clientProfile={clientProfile} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-bold mt-0.5", valueClass)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function InvoiceDetail({ invoice, clientProfile }: { invoice: any; clientProfile: any }) {
  const cfg = STATUS[invoice.status] || STATUS.pending;
  const balance = Number(invoice.amount) - Number(invoice.paid_amount || 0);
  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />{invoice.invoice_number}</DialogTitle>
          <Badge className={cn("gap-1 border-0", cfg.color)}><cfg.icon className="h-3 w-3" />{cfg.label}</Badge>
        </div>
      </DialogHeader>
      <div className="space-y-4 py-2">
        {invoice.description && <p className="text-sm text-muted-foreground">{invoice.description}</p>}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <Row label="Invoice Amount" value={`${invoice.currency} ${Number(invoice.amount).toLocaleString()}`} />
            <Row label="Amount Paid" value={`${invoice.currency} ${Number(invoice.paid_amount || 0).toLocaleString()}`} valueClass="text-emerald-600" />
            <Separator />
            <Row label="Balance Due" value={`${invoice.currency} ${balance.toLocaleString()}`} bold valueClass={balance > 0 ? "text-destructive" : "text-emerald-600"} />
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DateBox label="Issued" date={invoice.created_at} />
          <DateBox label="Due" date={invoice.due_date} highlight={invoice.status === "overdue"} />
          {invoice.paid_date && <DateBox label="Paid" date={invoice.paid_date} valueClass="text-emerald-600" />}
        </div>
        <Button className="w-full gap-2" onClick={() => downloadInvoicePDF(invoice, clientProfile)}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>
    </>
  );
}

function Row({ label, value, valueClass, bold }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold ? "font-bold" : "font-medium", valueClass)}>{value}</span>
    </div>
  );
}
function DateBox({ label, date, valueClass, highlight }: any) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium flex items-center gap-1", highlight && "text-destructive", valueClass)}>
        <Calendar className="h-3 w-3" /> {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
}

function StatementOfAccount({ invoices, clientProfile }: { invoices: any[]; clientProfile: any }) {
  const today = new Date();
  const buckets = { current: 0, b30: 0, b60: 0, b90: 0 };
  let billed = 0, paid = 0;
  const ledger: any[] = [];
  let running = 0;

  const sorted = [...invoices].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  for (const i of sorted) {
    if (i.status === "cancelled") continue;
    billed += Number(i.amount);
    paid += Number(i.paid_amount || 0);
    running += Number(i.amount);
    ledger.push({
      date: i.created_at, ref: i.invoice_number, desc: i.description || "Invoice",
      debit: Number(i.amount), credit: 0, balance: running, currency: i.currency,
    });
    if (Number(i.paid_amount || 0) > 0) {
      running -= Number(i.paid_amount);
      ledger.push({
        date: i.paid_date || i.updated_at, ref: i.invoice_number, desc: "Payment received",
        debit: 0, credit: Number(i.paid_amount), balance: running, currency: i.currency,
      });
    }
    const balanceDue = Number(i.amount) - Number(i.paid_amount || 0);
    if (balanceDue > 0 && i.status !== "paid") {
      const days = Math.floor((today.getTime() - new Date(i.due_date).getTime()) / 86400000);
      if (days <= 0) buckets.current += balanceDue;
      else if (days <= 30) buckets.b30 += balanceDue;
      else if (days <= 60) buckets.b60 += balanceDue;
      else buckets.b90 += balanceDue;
    }
  }
  const outstanding = billed - paid;

  const downloadStatementPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Statement of Account", 14, 18);
      doc.setFontSize(10);
      doc.text(`${clientProfile?.company_name || ""}`, 14, 26);
      doc.text(`Customer ID: ${clientProfile?.customer_id || ""}`, 14, 32);
      doc.text(`Generated: ${today.toLocaleDateString()}`, 14, 38);

      autoTable(doc, {
        startY: 46,
        head: [["Total Billed", "Total Paid", "Outstanding"]],
        body: [[`GHS ${billed.toLocaleString()}`, `GHS ${paid.toLocaleString()}`, `GHS ${outstanding.toLocaleString()}`]],
        theme: "grid", headStyles: { fillColor: [37, 99, 235] },
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 6,
        head: [["Current", "1-30 days", "31-60 days", "60+ days"]],
        body: [[
          `GHS ${buckets.current.toLocaleString()}`,
          `GHS ${buckets.b30.toLocaleString()}`,
          `GHS ${buckets.b60.toLocaleString()}`,
          `GHS ${buckets.b90.toLocaleString()}`,
        ]],
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
        theme: "striped", headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8 },
      });
      doc.save(`Statement-${clientProfile?.customer_id}-${today.toISOString().slice(0, 10)}.pdf`);
      toast.success("Statement downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Statement of Account</h3>
            <p className="text-xs text-muted-foreground">As of {today.toLocaleDateString()}</p>
          </div>
          <Button onClick={downloadStatementPDF} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <BucketCard label="Current" value={buckets.current} />
        <BucketCard label="1-30 days" value={buckets.b30} />
        <BucketCard label="31-60 days" value={buckets.b60} className="text-amber-600" />
        <BucketCard label="60+ days" value={buckets.b90} className="text-destructive" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions yet.</TableCell></TableRow>
              ) : ledger.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-sm">{new Date(l.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-sm">{l.ref}</TableCell>
                  <TableCell>{l.desc}</TableCell>
                  <TableCell className="text-right">{l.debit ? `${l.currency} ${l.debit.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right text-emerald-600">{l.credit ? `${l.currency} ${l.credit.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{l.currency} {l.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BucketCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
        <p className={cn("text-base font-bold mt-1", className)}>GHS {value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

function downloadInvoicePDF(invoice: any, clientProfile: any) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 14, 30);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 36);
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 14, 42);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 48);

    doc.setFontSize(11);
    doc.text("Bill To:", 14, 60);
    doc.setFontSize(10);
    doc.text(clientProfile?.company_name || "", 14, 66);
    doc.text(`Customer ID: ${clientProfile?.customer_id || ""}`, 14, 72);

    autoTable(doc, {
      startY: 84,
      head: [["Description", "Amount"]],
      body: [[invoice.description || "Service charge", `${invoice.currency} ${Number(invoice.amount).toLocaleString()}`]],
      theme: "grid", headStyles: { fillColor: [37, 99, 235] },
    });

    const balance = Number(invoice.amount) - Number(invoice.paid_amount || 0);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 4,
      body: [
        ["Subtotal", `${invoice.currency} ${Number(invoice.amount).toLocaleString()}`],
        ["Paid", `${invoice.currency} ${Number(invoice.paid_amount || 0).toLocaleString()}`],
        ["Balance Due", `${invoice.currency} ${balance.toLocaleString()}`],
      ],
      theme: "plain", styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold", halign: "right" }, 1: { halign: "right" } },
    });

    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    toast.success("Invoice downloaded");
  } catch (e: any) {
    toast.error(e?.message || "Failed to generate PDF");
  }
}
