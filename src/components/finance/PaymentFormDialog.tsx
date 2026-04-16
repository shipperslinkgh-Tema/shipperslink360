import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecordPayment, generatePaymentRef } from "@/hooks/useFinanceMutations";
import { useFinanceInvoices, useFinancePayables } from "@/hooks/useFinanceData";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; userName: string; defaultType?: "incoming" | "outgoing"; }

export function PaymentFormDialog({ open, onOpenChange, userName, defaultType = "incoming" }: Props) {
  const record = useRecordPayment();
  const { data: invoices = [] } = useFinanceInvoices();
  const { data: payables = [] } = useFinancePayables();
  const [ref, setRef] = useState("");
  const [form, setForm] = useState({
    type: defaultType, category: "agency_fee" as string, amount: 0, currency: "GHS",
    exchange_rate: 1, method: "bank_transfer", payment_date: new Date().toISOString().split("T")[0],
    description: "", customer: "", customer_id: "", vendor: "",
    invoice_id: "", invoice_number: "", payable_id: "", payable_ref: "", bank_account: "",
  });

  useEffect(() => { if (open) { generatePaymentRef().then(setRef); setForm(f => ({ ...f, type: defaultType as "incoming" | "outgoing" })); } }, [open, defaultType]);

  const handleInvoiceSelect = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) setForm(f => ({ ...f, invoice_id: id, invoice_number: inv.invoiceNumber, customer: inv.customer, customer_id: inv.customerId, amount: inv.totalAmount - inv.paidAmount, currency: inv.currency }));
  };

  const handlePayableSelect = (id: string) => {
    const p = payables.find(p => p.id === id);
    if (p) setForm(f => ({ ...f, payable_id: id, payable_ref: p.payableRef, vendor: p.vendor, amount: p.amount - p.paidAmount, currency: p.currency }));
  };

  const handleSubmit = () => {
    if (form.amount <= 0 || !form.description) return;
    record.mutate({
      ...form, payment_ref: ref, ghs_equivalent: form.amount * form.exchange_rate, created_by: userName,
    }, { onSuccess: () => onOpenChange(false) });
  };

  const unpaidInvoices = invoices.filter(i => i.status !== "paid" && i.status !== "cancelled");
  const unpaidPayables = payables.filter(p => p.status !== "paid");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Record Payment — {ref}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming (Receipt)</SelectItem>
                <SelectItem value="outgoing">Outgoing (Payment)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["bank_transfer", "cheque", "cash", "mobile_money"].map(m =>
                  <SelectItem key={m} value={m}>{m.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {form.type === "incoming" && (
            <div className="col-span-2 space-y-2">
              <Label>Against Invoice (optional)</Label>
              <Select value={form.invoice_id} onValueChange={handleInvoiceSelect}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>{unpaidInvoices.map(i => <SelectItem key={i.id} value={i.id}>{i.invoiceNumber} — {i.customer}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {form.type === "outgoing" && (
            <div className="col-span-2 space-y-2">
              <Label>Against Payable (optional)</Label>
              <Select value={form.payable_id} onValueChange={handlePayableSelect}>
                <SelectTrigger><SelectValue placeholder="Select payable" /></SelectTrigger>
                <SelectContent>{unpaidPayables.map(p => <SelectItem key={p.id} value={p.id}>{p.payableRef} — {p.vendor}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["GHS", "USD", "EUR", "GBP", "CNY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Bank Account</Label>
            <Input value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} placeholder="Account name" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={record.isPending}>{record.isPending ? "Recording..." : "Record Payment"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
