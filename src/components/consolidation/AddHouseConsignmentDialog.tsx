import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Consolidation } from "@/types/consolidation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consolidation: Consolidation;
}

const initial = {
  houseRef: "",
  shipperName: "",
  shipperAddress: "",
  consigneeName: "",
  consigneeAddress: "",
  notifyParty: "",
  description: "",
  hsCode: "",
  packages: "",
  packageType: "cartons",
  grossWeight: "",
  netWeight: "",
  cbm: "",
  freightCharge: "",
  handlingCharge: "",
  documentationFee: "",
  remarks: "",
};

export function AddHouseConsignmentDialog({ open, onOpenChange, consolidation }: Props) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const qc = useQueryClient();

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v ? Number(v) : 0);

  const handleSubmit = async () => {
    if (!form.shipperName || !form.consigneeName) {
      toast({ title: "Shipper and Consignee names are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const isAir = consolidation.type === "AIR";
      const totalCharge = num(form.freightCharge) + num(form.handlingCharge) + num(form.documentationFee);

      const payload: any = {
        consolidation_id: consolidation.id,
        shipper_name: form.shipperName,
        shipper_address: form.shipperAddress || null,
        consignee_name: form.consigneeName,
        consignee_address: form.consigneeAddress || null,
        notify_party: form.notifyParty || null,
        description: form.description || null,
        hs_code: form.hsCode || null,
        packages: num(form.packages),
        package_type: form.packageType,
        gross_weight: num(form.grossWeight),
        net_weight: num(form.netWeight),
        cbm: num(form.cbm),
        freight_charge: num(form.freightCharge),
        handling_charge: num(form.handlingCharge),
        documentation_fee: num(form.documentationFee),
        total_charge: totalCharge,
        remarks: form.remarks || null,
        cargo_status: "pending",
        customs_status: "pending",
      };
      if (isAir) payload.house_awb_number = form.houseRef || null;
      else payload.house_bl_number = form.houseRef || null;

      const { error } = await supabase.from("consolidation_shippers").insert(payload);
      if (error) throw error;

      // Update aggregate totals on consolidation
      const newCount = (consolidation.shippersCount || 0) + 1;
      const newCBM = (consolidation.totalCBM || 0) + num(form.cbm);
      const newWeight = (consolidation.totalWeight || 0) + num(form.grossWeight);
      const newPackages = (consolidation.totalPackages || 0) + num(form.packages);
      await supabase
        .from("consolidations")
        .update({
          shippers_count: newCount,
          total_cbm: newCBM,
          total_weight: newWeight,
          total_packages: newPackages,
        })
        .eq("id", consolidation.id);

      toast({ title: "House consignment added", description: form.shipperName });
      qc.invalidateQueries({ queryKey: ["consolidation-shippers"] });
      qc.invalidateQueries({ queryKey: ["consolidations"] });
      setForm(initial);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Failed to add consignment", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const isAir = consolidation.type === "AIR";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setForm(initial); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add House Consignment</DialogTitle>
          <DialogDescription>
            Attach a new {isAir ? "HAWB" : "HBL"} shipper to {consolidation.consolidationRef}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAir ? "House AWB Number" : "House BL Number"}</Label>
              <Input value={form.houseRef} onChange={(e) => set("houseRef", e.target.value)} placeholder={isAir ? "e.g., HAWB-001" : "e.g., HBL-001"} />
            </div>
            <div className="space-y-2">
              <Label>HS Code</Label>
              <Input value={form.hsCode} onChange={(e) => set("hsCode", e.target.value)} placeholder="e.g., 8471.30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Shipper Name *</Label>
              <Input value={form.shipperName} onChange={(e) => set("shipperName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Consignee Name *</Label>
              <Input value={form.consigneeName} onChange={(e) => set("consigneeName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipper Address</Label>
              <Input value={form.shipperAddress} onChange={(e) => set("shipperAddress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Consignee Address</Label>
              <Input value={form.consigneeAddress} onChange={(e) => set("consigneeAddress", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notify Party</Label>
            <Input value={form.notifyParty} onChange={(e) => set("notifyParty", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Cargo Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Packages</Label>
              <Input type="number" value={form.packages} onChange={(e) => set("packages", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Package Type</Label>
              <Select value={form.packageType} onValueChange={(v) => set("packageType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartons">Cartons</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="drums">Drums</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="crates">Crates</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CBM (m³)</Label>
              <Input type="number" step="0.01" value={form.cbm} onChange={(e) => set("cbm", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gross Weight (kg)</Label>
              <Input type="number" step="0.01" value={form.grossWeight} onChange={(e) => set("grossWeight", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Net Weight (kg)</Label>
              <Input type="number" step="0.01" value={form.netWeight} onChange={(e) => set("netWeight", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Freight Charge</Label>
              <Input type="number" step="0.01" value={form.freightCharge} onChange={(e) => set("freightCharge", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Handling Charge</Label>
              <Input type="number" step="0.01" value={form.handlingCharge} onChange={(e) => set("handlingCharge", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Documentation Fee</Label>
              <Input type="number" step="0.01" value={form.documentationFee} onChange={(e) => set("documentationFee", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Consignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
