import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Printer, Check, X, Receipt } from "lucide-react";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, amountInWords, itemsTotal, printExpenseVoucher, type ExpenseItem } from "@/lib/expenseVoucher";

const blankItem = (): ExpenseItem => ({ description: "", ref: "", amount: 0 });
const statusClass = (s: string) =>
  s === "approved" ? "bg-success/15 text-success" : s === "rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning";
const catLabel = (v: string) => EXPENSE_CATEGORIES.find((c) => c.value === v)?.label ?? v;
const fmt = (n: number) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpenseVouchers() {
  const { user, profile } = useAuth();
  const { canEdit: isAccounts } = useAccountsAccess();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [form, setForm] = useState<any>({});
  const [items, setItems] = useState<ExpenseItem[]>([blankItem()]);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["expense_vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expense_vouchers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: names = {} } = useQuery({
    queryKey: ["expense_voucher_names", vouchers.length],
    enabled: vouchers.length > 0,
    queryFn: async () => {
      const ids = [...new Set(vouchers.flatMap((v: any) => [v.submitted_by, v.reviewed_by]).filter(Boolean))];
      const { data } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      return Object.fromEntries((data ?? []).map((p: any) => [p.user_id, p.full_name]));
    },
  });

  const total = itemsTotal(items);

  const submit = useMutation({
    mutationFn: async () => {
      if (!form.paid_to?.trim()) throw new Error("Enter who is being paid");
      if (!form.category) throw new Error("Choose an expense category");
      if (form.category === "other" && !form.category_other?.trim()) throw new Error("Specify the other category");
      const clean = items.filter((i) => i.description.trim() || i.amount);
      if (!clean.length || total <= 0) throw new Error("Add at least one item with an amount");
      const { error } = await supabase.from("expense_vouchers").insert({
        voucher_date: form.voucher_date || undefined,
        job_ref: form.job_ref || null,
        paid_to: form.paid_to.trim(),
        account_no: form.account_no || null,
        payment_method: form.payment_method || "cash",
        category: form.category,
        category_other: form.category === "other" ? form.category_other : null,
        description: form.description || null,
        items: clean as any,
        total_amount: total,
        submitted_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Voucher submitted to Accounts for approval");
      qc.invalidateQueries({ queryKey: ["expense_vouchers"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: async (decision: "approved" | "rejected") => {
      const { error } = await supabase.rpc("expense_voucher_review" as any, { _id: review.id, _decision: decision, _note: note });
      if (error) throw error;
      return decision;
    },
    onSuccess: (d) => {
      toast.success(`Voucher ${d}`);
      qc.invalidateQueries({ queryKey: ["expense_vouchers"] });
      setReview(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const startNew = () => {
    setForm({ voucher_date: new Date().toISOString().slice(0, 10), payment_method: "cash" });
    setItems([blankItem()]);
    setOpen(true);
  };

  const print = (v: any) => {
    if (!printExpenseVoucher(v, { preparedBy: (names as any)[v.submitted_by], checkedBy: v.status === "approved" ? (names as any)[v.reviewed_by] : "" }))
      toast.error("Allow pop-ups to print the voucher");
  };

  const pending = vouchers.filter((v: any) => v.status === "submitted").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Receipt className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Expense Vouchers</h1>
            <p className="text-sm text-muted-foreground">
              {isAccounts ? `${pending} awaiting your approval` : "Submit expenses for Accounts approval"}
            </p>
          </div>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Expense Voucher</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3">Voucher No.</th><th className="p-3">Date</th><th className="p-3">Paid To</th>
                <th className="p-3">Category</th><th className="p-3 text-right">Amount (GHS)</th>
                {isAccounts && <th className="p-3">Submitted By</th>}
                <th className="p-3">Status</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && vouchers.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No expense vouchers yet.</td></tr>}
              {vouchers.map((v: any) => (
                <tr key={v.id} className="border-t hover:bg-muted/40">
                  <td className="p-3 font-mono">{v.voucher_no}</td>
                  <td className="p-3">{v.voucher_date}</td>
                  <td className="p-3">{v.paid_to}</td>
                  <td className="p-3 text-muted-foreground">{catLabel(v.category)}</td>
                  <td className="p-3 text-right font-medium">{fmt(v.total_amount)}</td>
                  {isAccounts && <td className="p-3">{(names as any)[v.submitted_by] ?? "—"}</td>}
                  <td className="p-3">
                    <Badge variant="outline" className={statusClass(v.status)}>{v.status === "submitted" ? "pending" : v.status}</Badge>
                    {v.review_note && <p className="text-xs text-muted-foreground mt-1">{v.review_note}</p>}
                  </td>
                  <td className="p-3 flex justify-end gap-1">
                    {isAccounts && v.status === "submitted" && v.submitted_by !== user?.id && (
                      <Button size="sm" variant="outline" onClick={() => { setReview(v); setNote(""); }}>Review</Button>
                    )}
                    <Button size="sm" variant="ghost" title="Print" onClick={() => print(v)}><Printer className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Expense Voucher</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={form.voucher_date ?? ""} onChange={(e) => setForm({ ...form, voucher_date: e.target.value })} /></div>
            <div><Label>File / Job Ref</Label><Input value={form.job_ref ?? ""} onChange={(e) => setForm({ ...form, job_ref: e.target.value })} /></div>
            <div><Label>Paid To *</Label><Input value={form.paid_to ?? ""} onChange={(e) => setForm({ ...form, paid_to: e.target.value })} /></div>
            <div><Label>Account / Mobile Money No.</Label><Input value={form.account_no ?? ""} onChange={(e) => setForm({ ...form, account_no: e.target.value })} /></div>
            <div>
              <Label>Payment</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expense Category *</Label>
              <Select value={form.category ?? ""} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.category === "other" && (
              <div className="sm:col-span-2"><Label>Specify category *</Label><Input value={form.category_other ?? ""} onChange={(e) => setForm({ ...form, category_other: e.target.value })} /></div>
            )}
            <div className="sm:col-span-2">
              <Label>Description / Particulars</Label>
              <Textarea rows={2} placeholder="Invoice no., vessel name, container no., B/L no., etc." value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted"><tr className="text-left"><th className="p-2">Item Description</th><th className="p-2">Invoice / Ref No.</th><th className="p-2 text-right w-36">Amount (GHS)</th><th className="w-10"></th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-1.5"><Input className="h-8" value={it.description} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></td>
                    <td className="p-1.5"><Input className="h-8" value={it.ref} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, ref: e.target.value } : x))} /></td>
                    <td className="p-1.5"><Input className="h-8 text-right" type="number" step="0.01" value={it.amount || ""} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} /></td>
                    <td className="p-1.5">{items.length > 1 && <Button size="sm" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-semibold">
                <tr><td className="p-2" colSpan={2}><Button size="sm" variant="outline" onClick={() => setItems([...items, blankItem()])}><Plus className="h-4 w-4 mr-1" />Add item</Button></td><td className="p-2 text-right">{fmt(total)}</td><td></td></tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">In words: {amountInWords(total) || "—"}</p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>Submit to Accounts</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review {review?.voucher_no}</DialogTitle></DialogHeader>
          {review && (
            <div className="space-y-2 text-sm">
              <p><b>Paid to:</b> {review.paid_to} {review.account_no && `(${review.account_no})`}</p>
              <p><b>Category:</b> {catLabel(review.category)}{review.category_other ? ` — ${review.category_other}` : ""}</p>
              {review.description && <p><b>Particulars:</b> {review.description}</p>}
              <ul className="border rounded divide-y">
                {(review.items ?? []).map((it: ExpenseItem, i: number) => (
                  <li key={i} className="flex justify-between p-2"><span>{it.description} {it.ref && <span className="text-muted-foreground">({it.ref})</span>}</span><span>{fmt(it.amount)}</span></li>
                ))}
              </ul>
              <p className="font-semibold text-right">Total: GHS {fmt(review.total_amount)}</p>
              <Label>Note (optional)</Label>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => decide.mutate("rejected")} disabled={decide.isPending}><X className="h-4 w-4 mr-1" />Reject</Button>
            <Button onClick={() => decide.mutate("approved")} disabled={decide.isPending}><Check className="h-4 w-4 mr-1" />Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
