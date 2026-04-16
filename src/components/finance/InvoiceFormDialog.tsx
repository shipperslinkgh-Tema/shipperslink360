import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateInvoice, generateInvoiceRef } from "@/hooks/useFinanceMutations";
import { useCustomerCredits } from "@/hooks/useFinanceData";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; userName: string; }

export function InvoiceFormDialog({ open, onOpenChange, userName }: Props) {
  const createInvoice = useCreateInvoice();
  const { data: customers = [] } = useCustomerCredits();
  const [ref, setRef] = useState("");
  const [form, setForm] = useState({
    invoice_type: "commercial", customer: "", customer_id: "", service_type: "agency_fee",
    currency: "GHS", exchange_rate: 1, subtotal: 0, tax_amount: 0, total_amount: 0,
    due_date: "", issue_date: new Date().toISOString().split("T")[0],
    description: "", notes: "", job_ref: "", shipment_ref: "", consolidation_ref: "",
  });

  useEffect(() => { if (open) generateInvoiceRef().then(setRef); }, [open]);
  useEffect(() => {
    const total = form.subtotal + form.tax_amount;
    setForm(f => ({ ...f, total_amount: total }));
  }, [form.subtotal, form.tax_amount]);

  const handleCustomerChange = (id: string) => {
    const c = customers.find(c => c.customerId === id);
    setForm(f => ({ ...f, customer: c?.customerName || "", customer_id: id }));
  };

  const handleSubmit = () => {
    if (!form.customer || !form.due_date || form.total_amount <= 0) return;
    const ghsEq = form.total_amount * form.exchange_rate;
    createInvoice.mutate({ ...form, invoice_number: ref, ghs_equivalent: ghsEq, created_by: userName }, {
      onSuccess: () => { onOpenChange(false); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Invoice — {ref}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={form.customer_id} onValueChange={handleCustomerChange}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map(c => <SelectItem key={c.customerId} value={c.customerId}>{c.customerName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Invoice Type</Label>
            <Select value={form.invoice_type} onValueChange={v => setForm(f => ({ ...f, invoice_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="proforma">Proforma</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="credit_note">Credit Note</SelectItem>
                <SelectItem value="debit_note">Debit Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agency_fee">Agency Fee</SelectItem>
                <SelectItem value="customs_duty">Customs Duty</SelectItem>
                <SelectItem value="freight">Freight</SelectItem>
                <SelectItem value="trucking">Trucking</SelectItem>
                <SelectItem value="warehousing">Warehousing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["GHS", "USD", "EUR", "GBP", "CNY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.currency !== "GHS" && (
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input type="number" step="0.0001" value={form.exchange_rate} onChange={e => setForm(f => ({ ...f, exchange_rate: parseFloat(e.target.value) || 1 }))} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Subtotal</Label>
            <Input type="number" step="0.01" value={form.subtotal || ""} onChange={e => setForm(f => ({ ...f, subtotal: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Tax Amount</Label>
            <Input type="number" step="0.01" value={form.tax_amount || ""} onChange={e => setForm(f => ({ ...f, tax_amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <Input type="number" value={form.total_amount} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Issue Date</Label>
            <Input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Job Ref</Label>
            <Input value={form.job_ref} onChange={e => setForm(f => ({ ...f, job_ref: e.target.value }))} placeholder="JOB-2026-..." />
          </div>
          <div className="space-y-2">
            <Label>Shipment/B/L Ref</Label>
            <Input value={form.shipment_ref} onChange={e => setForm(f => ({ ...f, shipment_ref: e.target.value }))} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createInvoice.isPending}>
            {createInvoice.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
