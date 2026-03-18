import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";
import { User, Phone, CreditCard, CalendarDays } from "lucide-react";

interface NewDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM = {
  name: "",
  phone: "",
  license_number: "",
  license_expiry: "",
  status: "available" as string,
};

export function NewDriverDialog({ open, onOpenChange }: NewDriverDialogProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Driver name is required");
      if (!form.phone.trim()) throw new Error("Phone number is required");
      if (!form.license_number.trim()) throw new Error("License number is required");

      const { error } = await supabase.from("drivers").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        license_number: form.license_number.trim(),
        license_expiry: form.license_expiry || null,
        status: form.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver registered successfully");
      setForm(INITIAL_FORM);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register driver");
    },
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Register New Driver
          </DialogTitle>
          <DialogDescription>
            Add a new driver to the fleet registry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="driver-name" className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="driver-name"
              placeholder="e.g. Kwame Asante"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="driver-phone" className="flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="driver-phone"
              placeholder="e.g. 024 123 4567"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="driver-license" className="flex items-center gap-1.5 text-sm">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              License Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="driver-license"
              placeholder="e.g. DL-123456"
              value={form.license_number}
              onChange={(e) => update("license_number", e.target.value)}
            />
          </div>

          {/* License Expiry */}
          <div className="space-y-2">
            <Label htmlFor="driver-expiry" className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              License Expiry
            </Label>
            <Input
              id="driver-expiry"
              type="date"
              value={form.license_expiry}
              onChange={(e) => update("license_expiry", e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm">Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-trip">On Trip</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Registering..." : "Register Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
