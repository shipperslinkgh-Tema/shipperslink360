import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";

interface NewTruckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRUCK_TYPES = [
  { value: "40ft", label: "40ft Truck" },
  { value: "20ft", label: "20ft Truck" },
  { value: "towing", label: "Towing Truck" },
  { value: "cargo", label: "Cargo Truck" },
];

export function NewTruckDialog({ open, onOpenChange }: NewTruckDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    registration_number: "",
    make: "",
    model: "",
    type: "",
    capacity: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trucks").insert({
        registration_number: form.registration_number,
        make: form.make,
        model: form.model,
        type: form.type,
        capacity: form.capacity || null,
        status: "available",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucking-trucks"] });
      toast.success("Truck added successfully");
      onOpenChange(false);
      setForm({ registration_number: "", make: "", model: "", type: "", capacity: "" });
    },
    onError: (err: any) => {
      toast.error("Failed to add truck: " + err.message);
    },
  });

  const canSubmit = form.registration_number && form.make && form.model && form.type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Truck</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Registration Number *</Label>
            <Input
              value={form.registration_number}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
              placeholder="e.g. GR-1234-22"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Truck Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select truck type" />
              </SelectTrigger>
              <SelectContent>
                {TRUCK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Make *</Label>
              <Input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="e.g. MAN"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model *</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. TGS 26.440"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Capacity</Label>
            <Input
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="e.g. 40 TON"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Truck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
