import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";
import VoucherDialog from "./VoucherDialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, Receipt } from "lucide-react";

const statusColor = (s: string) =>
  s === "paid" ? "bg-success/15 text-success" :
  s === "partially_paid" ? "bg-warning/15 text-warning" :
  s === "overdue" ? "bg-destructive/15 text-destructive" :
  s === "cancelled" ? "bg-muted text-muted-foreground" :
  "bg-primary/10 text-primary";

const isOverdue = (inv: any) => inv.status !== "paid" && inv.status !== "cancelled" && inv.due_date && new Date(inv.due_date) < new Date();

export default function AccountsInvoices() {
  const { canEdit } = useAccountsAccess();
  const [receiptFor, setReceiptFor] = useState<any | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["finance_invoices_acct"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_invoices").select("*").order("issue_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const exportPdf = (inv: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("INVOICE", 14, 18);
    doc.setFontSize(10);
    doc.text("Shippers Link Agencies Co., Ltd", 14, 26);
    doc.text(`Invoice #: ${inv.invoice_number}`, 140, 26);
    doc.text(`Date: ${inv.issue_date}`, 140, 32);
    doc.text(`Due: ${inv.due_date ?? "—"}`, 140, 38);
    doc.text(`Customer: ${inv.customer}`, 14, 44);
    autoTable(doc, {
      startY: 56,
      head: [["Description", "Amount"]],
      body: [
        [inv.description ?? inv.service_type ?? "Service", `${inv.currency} ${Number(inv.subtotal).toFixed(2)}`],
        ["Tax", `${inv.currency} ${Number(inv.tax_amount).toFixed(2)}`],
      ],
      foot: [["Total", `${inv.currency} ${Number(inv.total_amount).toFixed(2)}`]],
    });
    doc.save(`${inv.invoice_number}.pdf`);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Service</th>
                <th className="p-3">Issue / Due</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && invoices.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No invoices yet.</td></tr>}
              {invoices.map((inv: any) => {
                const overdue = isOverdue(inv);
                return (
                  <tr key={inv.id} className="border-t hover:bg-muted/40">
                    <td className="p-3 font-mono">{inv.invoice_number}</td>
                    <td className="p-3">{inv.customer}</td>
                    <td className="p-3 text-muted-foreground">{inv.service_type}</td>
                    <td className="p-3 text-xs">{inv.issue_date} → {inv.due_date}</td>
                    <td className="p-3 text-right font-medium">{inv.currency} {Number(inv.total_amount).toLocaleString()}</td>
                    <td className="p-3 text-right">{inv.currency} {Number(inv.paid_amount).toLocaleString()}</td>
                    <td className="p-3">
                      <Badge className={overdue ? "bg-destructive/15 text-destructive" : statusColor(inv.status)} variant="outline">
                        {overdue ? "overdue" : inv.status}
                      </Badge>
                    </td>
                    <td className="p-3 flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => exportPdf(inv)}><FileDown className="h-4 w-4" /></Button>
                      {canEdit && inv.status !== "paid" && inv.status !== "cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => setReceiptFor(inv)}>
                          <Receipt className="h-4 w-4 mr-1" />Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {receiptFor && (
        <VoucherDialog
          open={!!receiptFor}
          onOpenChange={(o) => !o && setReceiptFor(null)}
          type="receipt"
          preset={{
            voucher_type: "receipt",
            party_name: receiptFor.customer,
            customer_id: receiptFor.customer_id,
            invoice_id: receiptFor.id,
            currency: receiptFor.currency,
            reference: receiptFor.invoice_number,
            narration: `Receipt against invoice ${receiptFor.invoice_number}`,
          }}
        />
      )}
    </div>
  );
}
