import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Driver } from "@/types/trucking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TruckIcon, User, MapPin, Package, DollarSign, FileText } from "lucide-react";

interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trucks: Truck[];
  drivers: Driver[];
}

const INITIAL_FORM = {
  truck_type: "",
  truck_id: "",
  driver_id: "",
  container_number: "",
  bl_number: "",
  customer: "",
  origin: "",
  destination: "",
  pickup_date: "",
  delivery_date: "",
  trip_cost: "",
  driver_payment: "",
  fuel_cost: "",
  container_return_location: "",
  container_return_date: "",
  notes: "",
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      <Icon className="h-4 w-4" />
      {title}
    </div>
  );
}

export function NewTripDialog({ open, onOpenChange, trucks, drivers }: NewTripDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trucking_trips").insert({
        truck_id: form.truck_id,
        driver_id: form.driver_id,
        container_number: form.container_number || null,
        bl_number: form.bl_number || null,
        customer: form.customer || null,
        origin: form.origin,
        destination: form.destination,
        pickup_date: form.pickup_date || null,
        delivery_date: form.delivery_date || null,
        trip_cost: Number(form.trip_cost) || 0,
        driver_payment: Number(form.driver_payment) || 0,
        fuel_cost: Number(form.fuel_cost) || 0,
        container_return_location: form.container_return_location || null,
        container_return_date: form.container_return_date || null,
        notes: form.notes || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Trip created successfully");
      onOpenChange(false);
      setForm(INITIAL_FORM);
    },
    onError: (err: any) => {
      toast.error("Failed to create trip: " + err.message);
    },
  });

  const availableTrucks = trucks.filter((t) => t.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available");
  const canSubmit = form.truck_id && form.driver_id && form.origin && form.destination && form.truck_type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Trip</DialogTitle>
          <DialogDescription>Fill in the trip details below. Fields marked with * are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Vehicle & Driver */}
          <SectionHeader icon={TruckIcon} title="Vehicle & Driver" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Truck Type *</Label>
              <Select value={form.truck_type} onValueChange={(v) => setForm({ ...form, truck_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="40ft">40ft Truck</SelectItem>
                  <SelectItem value="20ft">20ft Truck</SelectItem>
                  <SelectItem value="towing">Towing Truck</SelectItem>
                  <SelectItem value="cargo">Cargo Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Truck *</Label>
              <Input value={form.truck_id} onChange={set("truck_id")} placeholder="e.g. GR-1234-22" />
            </div>
            <div className="space-y-1.5">
              <Label>Driver *</Label>
              <Input value={form.driver_id} onChange={set("driver_id")} placeholder="e.g. John Doe" />
            </div>
          </div>

          <Separator />

          {/* Customer & Cargo */}
          <SectionHeader icon={User} title="Customer & Cargo" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Input value={form.customer} onChange={set("customer")} placeholder="Customer name" />
            </div>
            <div className="space-y-1.5">
              <Label>Container Number</Label>
              <Input value={form.container_number} onChange={set("container_number")} placeholder="e.g. MSKU1234567" />
            </div>
            <div className="space-y-1.5">
              <Label>BL Number</Label>
              <Input value={form.bl_number} onChange={set("bl_number")} placeholder="e.g. BL-2026-001" />
            </div>
          </div>

          <Separator />

          {/* Route & Schedule */}
          <SectionHeader icon={MapPin} title="Route & Schedule" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Origin *</Label>
              <Input value={form.origin} onChange={set("origin")} placeholder="e.g. Tema Port" />
            </div>
            <div className="space-y-1.5">
              <Label>Destination *</Label>
              <Input value={form.destination} onChange={set("destination")} placeholder="e.g. Kumasi" />
            </div>
            <div className="space-y-1.5">
              <Label>Pickup Date</Label>
              <Input type="date" value={form.pickup_date} onChange={set("pickup_date")} />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Delivery Date</Label>
              <Input type="date" value={form.delivery_date} onChange={set("delivery_date")} />
            </div>
          </div>

          <Separator />

          {/* Financials */}
          <SectionHeader icon={DollarSign} title="Financials (GHS)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Trip Cost</Label>
              <Input type="number" value={form.trip_cost} onChange={set("trip_cost")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Driver Payment</Label>
              <Input type="number" value={form.driver_payment} onChange={set("driver_payment")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Cost</Label>
              <Input type="number" value={form.fuel_cost} onChange={set("fuel_cost")} placeholder="0.00" />
            </div>
          </div>

          <Separator />

          {/* Container Return */}
          <SectionHeader icon={Package} title="Container Return" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Return Location</Label>
              <Input value={form.container_return_location} onChange={set("container_return_location")} placeholder="e.g. Meridian Port" />
            </div>
            <div className="space-y-1.5">
              <Label>Return Date</Label>
              <Input type="date" value={form.container_return_date} onChange={set("container_return_date")} />
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <SectionHeader icon={FileText} title="Additional Notes" />
          <Textarea value={form.notes} onChange={set("notes")} placeholder="Any additional details about this trip..." rows={3} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
