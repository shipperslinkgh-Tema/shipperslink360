import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJobCost } from "@/hooks/useFinanceMutations";
import { useCustomerCredits } from "@/hooks/useFinanceData";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; userName: string; }

export function JobCostFormDialog({ open, onOpenChange, userName }: Props) {
  const create = useCreateJobCost();
  const { data: customers = [] } = useCustomerCredits();
  const [form, setForm] = useState({
    job_ref: "", job_type: "shipment", customer: "", customer_id: "",
    cost_category: "freight_sea", description: "", amount: 0, currency: "GHS",
    exchange_rate: 1, vendor: "", shipment_ref: "", consolidation_ref: "",
  });

  const handleCustomerChange = (id: string) => {
    const c = customers.find(c => c.customerId === id);
    setForm(f => ({ ...f, customer: c?.customerName || "", customer_id: id }));
  };

  const handleSubmit = () => {
    if (!form.job_ref || !form.customer || !form.description || form.amount <= 0) return;
    create.mutate({
      ...form, ghs_equivalent: form.amount * form.exchange_rate, created_by: userName,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Job Cost</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Job Reference</Label>
            <Input value={form.job_ref} onChange={e => setForm(f => ({ ...f, job_ref: e.target.value }))} placeholder="JOB-2026-..." />
          </div>
          <div className="space-y-2">
            <Label>Job Type</Label>
            <Select value={form.job_type} onValueChange={v => setForm(f => ({ ...f, job_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shipment">Shipment</SelectItem>
                <SelectItem value="consolidation">Consolidation</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Customer</Label>
            <Select value={form.customer_id} onValueChange={handleCustomerChange}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map(c => <SelectItem key={c.customerId} value={c.customerId}>{c.customerName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cost Category</Label>
            <Select value={form.cost_category} onValueChange={v => setForm(f => ({ ...f, cost_category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["freight_sea", "freight_air", "customs_duty", "customs_vat", "gpha_charges", "shipping_line_do", "demurrage", "detention", "trucking", "warehousing", "documentation", "handling", "insurance", "agency_fee", "other"].map(c =>
                  <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
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
          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>{create.isPending ? "Adding..." : "Add Cost"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
