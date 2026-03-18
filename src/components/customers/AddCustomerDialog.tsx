import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();

  const [form, setForm] = useState({
    companyName: "",
    tinNumber: "",
    isImporter: false,
    isExporter: false,
    contactName: "",
    phone: "",
    email: "",
    warehouseDestinations: [] as string[],
    notes: "",
  });

  const [warehouseInput, setWarehouseInput] = useState("");

  const update = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addWarehouse = () => {
    const trimmed = warehouseInput.trim();
    if (trimmed && !form.warehouseDestinations.includes(trimmed)) {
      update("warehouseDestinations", [...form.warehouseDestinations, trimmed]);
      setWarehouseInput("");
    }
  };

  const removeWarehouse = (w: string) =>
    update("warehouseDestinations", form.warehouseDestinations.filter((d) => d !== w));

  const getCompanyType = (): "importer" | "exporter" | "both" | "freight_forwarder" => {
    if (form.isImporter && form.isExporter) return "both";
    if (form.isImporter) return "importer";
    if (form.isExporter) return "exporter";
    return "importer";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      toast({ title: "Validation Error", description: "Customer Name is required", variant: "destructive" });
      return;
    }
    if (!form.contactName.trim()) {
      toast({ title: "Validation Error", description: "Contact Person is required", variant: "destructive" });
      return;
    }
    if (!form.phone.trim()) {
      toast({ title: "Validation Error", description: "Contact Number is required", variant: "destructive" });
      return;
    }
    if (!form.isImporter && !form.isExporter) {
      toast({ title: "Validation Error", description: "Select at least one Customer Type", variant: "destructive" });
      return;
    }

    try {
      await createCustomer.mutateAsync({
        companyName: form.companyName.trim(),
        tinNumber: form.tinNumber.trim(),
        companyType: getCompanyType(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        warehouseDestinations: form.warehouseDestinations,
        notes: form.notes.trim() || undefined,
      });

      toast({ title: "Success", description: "Customer registered successfully" });
      setForm({
        companyName: "",
        tinNumber: "",
        isImporter: false,
        isExporter: false,
        contactName: "",
        phone: "",
        email: "",
        warehouseDestinations: [],
        notes: "",
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create customer", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Customer Name *</Label>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Company / Business name"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label>TIN Number</Label>
            <Input
              value={form.tinNumber}
              onChange={(e) => update("tinNumber", e.target.value)}
              placeholder="Tax Identification Number"
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Customer Type *</Label>
            <div className="flex items-center gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.isImporter}
                  onCheckedChange={(v) => update("isImporter", !!v)}
                />
                <span className="text-sm">Importer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.isExporter}
                  onCheckedChange={(v) => update("isExporter", !!v)}
                />
                <span className="text-sm">Exporter</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Person *</Label>
              <Input
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                placeholder="Full name"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Number *</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+233 XX XXX XXXX"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Warehouse Destination(s)</Label>
            <div className="flex gap-2">
              <Input
                value={warehouseInput}
                onChange={(e) => setWarehouseInput(e.target.value)}
                placeholder="e.g. Tema, Takoradi"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addWarehouse();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addWarehouse}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.warehouseDestinations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.warehouseDestinations.map((w) => (
                  <Badge key={w} variant="secondary" className="gap-1">
                    {w}
                    <button type="button" onClick={() => removeWarehouse(w)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Saving..." : "Register Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
