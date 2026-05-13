import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExpense, generateExpenseRef } from "@/hooks/useFinanceMutations";
import { useExchangeRate } from "@/hooks/useFXRates";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; userName: string; }

export function ExpenseFormDialog({ open, onOpenChange, userName }: Props) {
  const create = useCreateExpense();
  const [ref, setRef] = useState("");
  const [form, setForm] = useState({
    category: "other", description: "", amount: 0, currency: "GHS",
    exchange_rate: 1, expense_date: new Date().toISOString().split("T")[0], notes: "",
  });

  useEffect(() => { if (open) generateExpenseRef().then(setRef); }, [open]);
  const { rate: liveRate, loading: rateLoading, date: rateDate } = useExchangeRate(form.currency);
  useEffect(() => {
    if (form.currency !== "GHS" && liveRate && liveRate !== 1) setForm(f => ({ ...f, exchange_rate: Number(liveRate.toFixed(4)) }));
    else if (form.currency === "GHS") setForm(f => ({ ...f, exchange_rate: 1 }));
  }, [form.currency, liveRate]);

  const handleSubmit = () => {
    if (!form.description || form.amount <= 0) return;
    create.mutate({
      ...form, expense_ref: ref, ghs_equivalent: form.amount * form.exchange_rate, requested_by: userName,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Expense — {ref}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["rent", "utilities", "supplies", "maintenance", "transport", "salary", "tax", "insurance", "other"].map(c =>
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          {form.currency !== "GHS" && (
            <div className="space-y-2">
              <Label>Exchange Rate {rateLoading ? "(loading...)" : rateDate ? `(live ${rateDate})` : ""}</Label>
              <Input type="number" step="0.0001" value={form.exchange_rate} onChange={e => setForm(f => ({ ...f, exchange_rate: parseFloat(e.target.value) || 1 }))} />
              <p className="text-xs text-muted-foreground">1 {form.currency} = {form.exchange_rate} GHS</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["GHS", "USD", "EUR", "GBP", "CNY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
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
          <Button onClick={handleSubmit} disabled={create.isPending}>{create.isPending ? "Creating..." : "Record Expense"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
