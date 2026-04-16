import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRenewal } from "@/hooks/useFinanceMutations";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function RenewalFormDialog({ open, onOpenChange }: Props) {
  const create = useCreateRenewal();
  const [form, setForm] = useState({
    registration_type: "Annual Returns", registrar_name: "", description: "",
    expiry_date: "", renewal_fee: 0, currency: "GHS", certificate_number: "", notes: "",
  });

  const handleSubmit = () => {
    if (!form.registrar_name || !form.expiry_date) return;
    create.mutate(form, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Registration / Renewal</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Registration Type</Label>
            <Select value={form.registration_type} onValueChange={v => setForm(f => ({ ...f, registration_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Annual Returns", "Business Registration", "Tax Clearance", "SSNIT Certificate", "Fire Certificate", "EPA Permit", "Operating License"].map(t =>
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Registrar Name</Label>
            <Input value={form.registrar_name} onChange={e => setForm(f => ({ ...f, registrar_name: e.target.value }))} placeholder="e.g. Registrar General" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Renewal Fee</Label>
            <Input type="number" step="0.01" value={form.renewal_fee || ""} onChange={e => setForm(f => ({ ...f, renewal_fee: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Certificate Number</Label>
            <Input value={form.certificate_number} onChange={e => setForm(f => ({ ...f, certificate_number: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>{create.isPending ? "Creating..." : "Add Renewal"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
