import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = {
  customer_id: "",
  bl_number: "",
  awb_number: "",
  container_number: "",
  vessel_name: "",
  voyage_number: "",
  flight_number: "",
  origin: "",
  destination: "Tema, GH",
  shipment_type: "sea",
  cargo_description: "",
  weight_kg: "",
  volume_cbm: "",
  eta: "",
  incoterms: "",
  notes: "",
};

export function NewShipmentDialog({ open, onOpenChange }: NewShipmentDialogProps) {
  const { data: customers = [] } = useCustomers();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const selectedCustomer = customers.find((c) => c.id === form.customer_id);

  const handleSubmit = async () => {
    if (!form.customer_id || !form.origin) {
      toast.error("Please fill in required fields (Customer, Origin)");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("client_shipments").insert({
        customer_id: form.customer_id,
        bl_number: form.bl_number || `BL-${Date.now()}`,
        container_number: form.container_number || null,
        vessel_name: form.vessel_name || null,
        voyage_number: form.voyage_number || null,
        origin: form.origin,
        destination: form.destination || "Tema, GH",
        cargo_description: form.cargo_description || null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        eta: form.eta || null,
        status: "pending",
        notes: form.notes || null,
      });

      if (error) throw error;
      toast.success("Shipment created successfully");
      onOpenChange(false);
      setForm(initialForm);
    } catch (err: any) {
      toast.error(err.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Shipment</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Customer */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Customer *</h3>
            <Select value={form.customer_id} onValueChange={(v) => update("customer_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCustomer && (
              <p className="text-xs text-muted-foreground">
                Contact: {selectedCustomer.phone || selectedCustomer.email}
              </p>
            )}
          </div>

          {/* Shipment Type & Reference */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Shipment Details</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Shipment Type *</Label>
                <Select value={form.shipment_type} onValueChange={(v) => update("shipment_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea">Sea Freight</SelectItem>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{form.shipment_type === "air" ? "AWB Number" : "BL Number"}</Label>
                <Input
                  value={form.shipment_type === "air" ? form.awb_number : form.bl_number}
                  onChange={(e) => update(form.shipment_type === "air" ? "awb_number" : "bl_number", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Container Number</Label>
                <Input value={form.container_number} onChange={(e) => update("container_number", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Route</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Origin *</Label>
                <Input value={form.origin} onChange={(e) => update("origin", e.target.value)} placeholder="e.g. Shanghai, CN" />
              </div>
              <div>
                <Label className="text-xs">Destination</Label>
                <Input value={form.destination} onChange={(e) => update("destination", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Vessel & Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Vessel & Schedule</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">{form.shipment_type === "air" ? "Flight Number" : "Vessel Name"}</Label>
                <Input
                  value={form.shipment_type === "air" ? form.flight_number : form.vessel_name}
                  onChange={(e) => update(form.shipment_type === "air" ? "flight_number" : "vessel_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Voyage Number</Label>
                <Input value={form.voyage_number} onChange={(e) => update("voyage_number", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">ETA</Label>
                <Input type="date" value={form.eta} onChange={(e) => update("eta", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Cargo</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Weight (KG)</Label>
                <Input type="number" value={form.weight_kg} onChange={(e) => update("weight_kg", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Volume (CBM)</Label>
                <Input type="number" value={form.volume_cbm} onChange={(e) => update("volume_cbm", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Incoterms</Label>
                <Select value={form.incoterms} onValueChange={(v) => update("incoterms", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                    <SelectItem value="CFR">CFR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Cargo Description</Label>
              <Textarea value={form.cargo_description} onChange={(e) => update("cargo_description", e.target.value)} className="h-16" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="h-16" />
          </div>

          <Button onClick={handleSubmit} disabled={!form.customer_id || !form.origin || loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Shipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
