import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePayable, generatePayableRef } from "@/hooks/useFinanceMutations";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; userName: string; }

export function PayableFormDialog({ open, onOpenChange, userName }: Props) {
  const create = useCreatePayable();
  const [ref, setRef] = useState("");
  const [form, setForm] = useState({
    vendor: "", vendor_category: "shipping_line", description: "",
    amount: 0, currency: "GHS", exchange_rate: 1, due_date: "",
    job_ref: "", shipment_ref: "", consolidation_ref: "", invoice_number: "", notes: "",
  });

  useEffect(() => { if (open) generatePayableRef().then(setRef); }, [open]);

  const handleSubmit = () => {
    if (!form.vendor || !form.description || form.amount <= 0 || !form.due_date) return;
    create.mutate({
      ...form, payable_ref: ref, ghs_equivalent: form.amount * form.exchange_rate, created_by: userName,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Payable — {ref}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Vendor name" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.vendor_category} onValueChange={v => setForm(f => ({ ...f, vendor_category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["shipping_line", "customs", "gpha", "trucking", "warehouse", "agent", "office", "other"].map(c =>
                  <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
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
          {form.currency !== "GHS" && (
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input type="number" step="0.0001" value={form.exchange_rate} onChange={e => setForm(f => ({ ...f, exchange_rate: parseFloat(e.target.value) || 1 }))} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Job Ref</Label>
            <Input value={form.job_ref} onChange={e => setForm(f => ({ ...f, job_ref: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} />
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
          <Button onClick={handleSubmit} disabled={create.isPending}>{create.isPending ? "Creating..." : "Create Payable"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
