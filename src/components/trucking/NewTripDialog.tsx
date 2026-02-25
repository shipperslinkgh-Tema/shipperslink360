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
import { toast } from "sonner";

interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trucks: Truck[];
  drivers: Driver[];
}

export function NewTripDialog({ open, onOpenChange, trucks, drivers }: NewTripDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    truck_id: "",
    driver_id: "",
    truck_type: "",
    container_number: "",
    bl_number: "",
    customer: "",
    origin: "",
    destination: "",
    pickup_date: "",
    trip_cost: "",
    driver_payment: "",
    fuel_cost: "",
    container_return_location: "",
    notes: "",
  });

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
        trip_cost: Number(form.trip_cost) || 0,
        driver_payment: Number(form.driver_payment) || 0,
        fuel_cost: Number(form.fuel_cost) || 0,
        container_return_location: form.container_return_location || null,
        notes: form.notes || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Trip created successfully");
      onOpenChange(false);
      setForm({
        truck_id: "", driver_id: "", truck_type: "", container_number: "", bl_number: "",
        customer: "", origin: "", destination: "", pickup_date: "",
        trip_cost: "", driver_payment: "", fuel_cost: "",
        container_return_location: "", notes: "",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to create trip: " + err.message);
    },
  });

  const availableTrucks = trucks.filter((t) => t.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available");

  const canSubmit = form.truck_id && form.driver_id && form.origin && form.destination;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Truck Type */}
          <div className="space-y-1.5">
            <Label>Truck Type *</Label>
            <Select value={form.truck_type} onValueChange={(v) => setForm({ ...form, truck_type: v })}>
              <SelectTrigger><SelectValue placeholder="Select truck type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="40ft">40ft Truck</SelectItem>
                <SelectItem value="20ft">20ft Truck</SelectItem>
                <SelectItem value="towing">Towing Truck</SelectItem>
                <SelectItem value="cargo">Cargo Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Truck & Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Truck *</Label>
              <Select value={form.truck_id} onValueChange={(v) => setForm({ ...form, truck_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  {availableTrucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.registrationNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Driver *</Label>
              <Select value={form.driver_id} onValueChange={(v) => setForm({ ...form, driver_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Container & BL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Container Number</Label>
              <Input value={form.container_number} onChange={(e) => setForm({ ...form, container_number: e.target.value })} placeholder="e.g. MSKU1234567" />
            </div>
            <div className="space-y-1.5">
              <Label>BL Number</Label>
              <Input value={form.bl_number} onChange={(e) => setForm({ ...form, bl_number: e.target.value })} placeholder="e.g. BL-2026-001" />
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
          </div>

          {/* Route */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Origin *</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Tema Port" />
            </div>
            <div className="space-y-1.5">
              <Label>Destination *</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Kumasi" />
            </div>
          </div>

          {/* Pickup Date */}
          <div className="space-y-1.5">
            <Label>Pickup Date</Label>
            <Input type="date" value={form.pickup_date} onChange={(e) => setForm({ ...form, pickup_date: e.target.value })} />
          </div>

          {/* Financial */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Trip Cost (GHS)</Label>
              <Input type="number" value={form.trip_cost} onChange={(e) => setForm({ ...form, trip_cost: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Driver Pay (GHS)</Label>
              <Input type="number" value={form.driver_payment} onChange={(e) => setForm({ ...form, driver_payment: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Cost (GHS)</Label>
              <Input type="number" value={form.fuel_cost} onChange={(e) => setForm({ ...form, fuel_cost: e.target.value })} placeholder="0" />
            </div>
          </div>

          {/* Container Return Location */}
          <div className="space-y-1.5">
            <Label>Container Return Location</Label>
            <Input value={form.container_return_location} onChange={(e) => setForm({ ...form, container_return_location: e.target.value })} placeholder="e.g. Meridian Port" />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
