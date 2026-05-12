import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Send } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";
import { usePostVoucher, useSaveVoucher, useVoucher } from "@/hooks/useVouchers";
import { CURRENCIES, VOUCHER_TYPE_LABEL, type Voucher, type VoucherLine, type VoucherType } from "@/types/accounts";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  type: VoucherType;
  voucherId?: string | null;
  preset?: Partial<Voucher>;
  presetLines?: VoucherLine[];
  consignments?: { id: string; consignment_ref: string; client_name: string }[];
  customers?: { id: string; company_name: string; customer_code: string | null }[];
}

const blankLine = (): VoucherLine => ({ account_id: "", debit: 0, credit: 0, description: "" });

export default function VoucherDialog({ open, onOpenChange, type, voucherId, preset, presetLines, consignments = [], customers = [] }: Props) {
  const { data: accounts = [] } = useChartOfAccounts();
  const { data: existing } = useVoucher(voucherId ?? undefined);
  const save = useSaveVoucher();
  const post = usePostVoucher();

  const [form, setForm] = useState<Partial<Voucher>>({});
  const [lines, setLines] = useState<VoucherLine[]>([blankLine(), blankLine()]);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setForm(existing.voucher);
      setLines(existing.lines.length ? existing.lines : [blankLine(), blankLine()]);
    } else {
      setForm({
        voucher_type: type,
        voucher_date: new Date().toISOString().slice(0, 10),
        currency: "GHS",
        exchange_rate: 1,
        status: "draft",
        ...preset,
      });
      setLines(presetLines && presetLines.length ? presetLines : [blankLine(), blankLine()]);
    }
  }, [open, existing, type, preset, presetLines]);

  const isPosted = form.status === "posted" || form.status === "cancelled";

  const totals = useMemo(() => {
    const dr = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const cr = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    return { dr, cr, balanced: Math.abs(dr - cr) < 0.005 && dr > 0 };
  }, [lines]);

  const updateLine = (i: number, patch: Partial<VoucherLine>) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const handleSave = async (alsoPost: boolean) => {
    if (alsoPost && !totals.balanced) {
      toast.error("Voucher must be balanced before posting");
      return;
    }
    const id = await save.mutateAsync({ voucher: { ...form, voucher_type: type }, lines });
    if (alsoPost) await post.mutateAsync(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form.voucher_no ? form.voucher_no : "New"} — {VOUCHER_TYPE_LABEL[type]}
            {form.status && (
              <span
                className={`ml-3 text-xs px-2 py-0.5 rounded ${
                  form.status === "posted" ? "bg-success/15 text-success" : form.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
                }`}
              >
                {form.status}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Date</Label>
            <Input type="date" disabled={isPosted} value={form.voucher_date ?? ""} onChange={(e) => setForm({ ...form, voucher_date: e.target.value })} />
          </div>
          <div>
            <Label>Reference</Label>
            <Input disabled={isPosted} value={form.reference ?? ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Optional" />
          </div>
          <div>
            <Label>{type === "receipt" ? "Customer / Payer" : "Payee"}</Label>
            <Input disabled={isPosted} value={form.party_name ?? ""} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
          </div>

          <div>
            <Label>Currency</Label>
            <Select disabled={isPosted} value={form.currency ?? "GHS"} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Exchange Rate (→ GHS)</Label>
            <Input type="number" step="0.0001" disabled={isPosted} value={form.exchange_rate ?? 1} onChange={(e) => setForm({ ...form, exchange_rate: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select disabled={isPosted} value={form.payment_method ?? ""} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Linked Consignment</Label>
            <Select disabled={isPosted} value={form.consignment_id ?? "_none"} onValueChange={(v) => setForm({ ...form, consignment_id: v === "_none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— None —</SelectItem>
                {consignments.map((c) => <SelectItem key={c.id} value={c.id}>{c.consignment_ref} — {c.client_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Linked Customer</Label>
            <Select disabled={isPosted} value={form.customer_id ?? "_none"} onValueChange={(v) => setForm({ ...form, customer_id: v === "_none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— None —</SelectItem>
                {customers.map((c) => <SelectItem key={c.id} value={c.customer_code ?? c.id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label>Narration</Label>
            <Textarea disabled={isPosted} rows={2} value={form.narration ?? ""} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-2">Account</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-right w-32">Debit</th>
                <th className="p-2 text-right w-32">Credit</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-t">
                  <td className="p-1.5">
                    <Select disabled={isPosted} value={line.account_id || ""} onValueChange={(v) => updateLine(i, { account_id: v })}>
                      <SelectTrigger className="h-8"><SelectValue placeholder="Select account" /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1.5">
                    <Input className="h-8" disabled={isPosted} value={line.description ?? ""} onChange={(e) => updateLine(i, { description: e.target.value })} />
                  </td>
                  <td className="p-1.5">
                    <Input className="h-8 text-right" type="number" step="0.01" disabled={isPosted} value={line.debit || ""} onChange={(e) => updateLine(i, { debit: Number(e.target.value), credit: 0 })} />
                  </td>
                  <td className="p-1.5">
                    <Input className="h-8 text-right" type="number" step="0.01" disabled={isPosted} value={line.credit || ""} onChange={(e) => updateLine(i, { credit: Number(e.target.value), debit: 0 })} />
                  </td>
                  <td className="p-1.5 text-center">
                    {!isPosted && lines.length > 2 && (
                      <Button size="sm" variant="ghost" onClick={() => setLines(lines.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 font-semibold">
              <tr>
                <td className="p-2" colSpan={2}>
                  {!isPosted && (
                    <Button size="sm" variant="outline" onClick={() => setLines([...lines, blankLine()])}>
                      <Plus className="h-4 w-4 mr-1" /> Add line
                    </Button>
                  )}
                </td>
                <td className="p-2 text-right">{totals.dr.toFixed(2)}</td>
                <td className="p-2 text-right">{totals.cr.toFixed(2)}</td>
                <td></td>
              </tr>
              <tr>
                <td className="p-2 text-xs" colSpan={2}>
                  {totals.balanced ? <span className="text-success">✓ Balanced</span> : <span className="text-destructive">Difference: {(totals.dr - totals.cr).toFixed(2)}</span>}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          {!isPosted && (
            <>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={save.isPending}>Save Draft</Button>
              <Button onClick={() => handleSave(true)} disabled={save.isPending || post.isPending || !totals.balanced}>
                <Send className="h-4 w-4 mr-1" /> Save & Post
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
