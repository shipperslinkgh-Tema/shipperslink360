import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateConsignment } from "@/hooks/useConsignmentWorkflow";
import { useCustomers } from "@/hooks/useCustomers";
import { DocumentScanner } from "./DocumentScanner";
import { mapExtractedDataToForm, type ExtractedDocumentData } from "@/hooks/useDocumentProcessor";

interface NewConsignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConsignmentDialog({ open, onOpenChange }: NewConsignmentDialogProps) {
  const createMutation = useCreateConsignment();
  const { data: customers = [] } = useCustomers();

  const [form, setForm] = useState({
    client_name: "",
    client_contact: "",
    client_id: "",
    supplier_name: "",
    origin_country: "",
    port_of_loading: "",
    port_of_discharge: "Tema",
    container_number: "",
    bl_number: "",
    awb_number: "",
    cargo_description: "",
    weight_kg: "",
    volume_cbm: "",
    shipment_type: "sea",
    eta: "",
    vessel_name: "",
    voyage_number: "",
    incoterms: "",
    assigned_officer: "",
    notes: "",
    is_urgent: false,
  });

  const handleSubmit = async () => {
    if (!form.client_name) return;
    await createMutation.mutateAsync({
      client_name: form.client_name,
      client_contact: form.client_contact || null,
      client_id: form.client_id || null,
      supplier_name: form.supplier_name || null,
      origin_country: form.origin_country || null,
      port_of_loading: form.port_of_loading || null,
      port_of_discharge: form.port_of_discharge || null,
      container_number: form.container_number || null,
      bl_number: form.bl_number || null,
      awb_number: form.awb_number || null,
      cargo_description: form.cargo_description || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      volume_cbm: form.volume_cbm ? parseFloat(form.volume_cbm) : null,
      shipment_type: form.shipment_type,
      eta: form.eta || null,
      vessel_name: form.vessel_name || null,
      voyage_number: form.voyage_number || null,
      incoterms: form.incoterms || null,
      assigned_officer: form.assigned_officer || null,
      notes: form.notes || null,
      is_urgent: form.is_urgent,
    } as any);
    onOpenChange(false);
    setForm({
      client_name: "", client_contact: "", client_id: "", supplier_name: "",
      origin_country: "", port_of_loading: "", port_of_discharge: "Tema",
      container_number: "", bl_number: "", awb_number: "", cargo_description: "",
      weight_kg: "", volume_cbm: "", shipment_type: "sea", eta: "",
      vessel_name: "", voyage_number: "", incoterms: "", assigned_officer: "",
      notes: "", is_urgent: false,
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setForm((f) => ({
        ...f,
        client_id: customerId,
        client_name: customer.companyName,
        client_contact: customer.phone || "",
      }));
    }
  };

  const handleDocumentExtracted = (data: ExtractedDocumentData) => {
    const mapped = mapExtractedDataToForm(data);
    setForm((prev) => {
      const updated = { ...prev };
      for (const [key, value] of Object.entries(mapped)) {
        if (key in updated && value) {
          // Only overwrite empty fields or explicit overwrite
          if (!(updated as any)[key] || (updated as any)[key] === "" || (updated as any)[key] === "Tema") {
            (updated as any)[key] = value;
          }
        }
      }
      return updated;
    });
  };

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Consignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Document Scanner */}
          <DocumentScanner onDataExtracted={handleDocumentExtracted} compact />

          {/* Client & Supplier */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Client & Supplier</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Select Client</Label>
                <Select value={form.client_id} onValueChange={handleCustomerSelect}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Client Name *</Label>
                <Input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Client Contact</Label>
                <Input value={form.client_contact} onChange={(e) => update("client_contact", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Supplier Name</Label>
                <Input value={form.supplier_name} onChange={(e) => update("supplier_name", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Shipment Details</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Shipment Type</Label>
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
                <Label className="text-xs">Container Number</Label>
                <Input value={form.container_number} onChange={(e) => update("container_number", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{form.shipment_type === "air" ? "AWB Number" : "BL Number"}</Label>
                <Input
                  value={form.shipment_type === "air" ? form.awb_number : form.bl_number}
                  onChange={(e) => update(form.shipment_type === "air" ? "awb_number" : "bl_number", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Origin Country</Label>
                <Input value={form.origin_country} onChange={(e) => update("origin_country", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Port of Loading</Label>
                <Input value={form.port_of_loading} onChange={(e) => update("port_of_loading", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Port of Discharge</Label>
                <Input value={form.port_of_discharge} onChange={(e) => update("port_of_discharge", e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Cargo Description</Label>
              <Textarea value={form.cargo_description} onChange={(e) => update("cargo_description", e.target.value)} className="h-16" />
            </div>
          </div>

          {/* Vessel & Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Vessel & Schedule</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Vessel Name</Label>
                <Input value={form.vessel_name} onChange={(e) => update("vessel_name", e.target.value)} />
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
          </div>

          {/* Assignment & Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1">Assignment</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Assigned Officer</Label>
                <Input value={form.assigned_officer} onChange={(e) => update("assigned_officer", e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.is_urgent} onCheckedChange={(v) => update("is_urgent", v)} />
                <Label className="text-xs">Mark as Urgent</Label>
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="h-16" />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!form.client_name || createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Consignment & Receive Documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
