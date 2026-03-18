import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trucking";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, CheckCircle2 } from "lucide-react";

interface ContainerReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
}

export function ContainerReturnDialog({ open, onOpenChange, trip }: ContainerReturnDialogProps) {
  const queryClient = useQueryClient();
  const [returnLocation, setReturnLocation] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [tripCostPaid, setTripCostPaid] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!trip) throw new Error("No trip selected");
      const { error } = await supabase
        .from("trucking_trips")
        .update({
          container_returned: true,
          container_return_location: returnLocation || null,
          container_return_date: returnDate || null,
          notes: trip.notes ? `${trip.notes}\n[Container Return] ${notes}` : notes || null,
        })
        .eq("id", trip.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Container return confirmed");
      onOpenChange(false);
      setReturnLocation("");
      setReturnDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    },
    onError: (err: any) => {
      toast.error("Failed to confirm return: " + err.message);
    },
  });

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Confirm Container Return
          </DialogTitle>
          <DialogDescription>
            Confirm that the container for this trip has been returned.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Container: {trip.containerNumber || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              BL: {trip.blNumber || "N/A"} • Customer: {trip.customer || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              Route: {trip.origin} → {trip.destination}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Return Location *</Label>
            <Input
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              placeholder="e.g. Meridian Port, Tema Port"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Return Date *</Label>
            <Input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the container return..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!returnLocation || !returnDate || mutation.isPending}
          >
            {mutation.isPending ? "Confirming..." : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
