import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateConsignment } from "@/hooks/useCompletedConsignments";

const schema = z.object({
  client_name: z.string().trim().min(1, "Client name is required").max(200),
  shipment_type: z.enum(["sea", "air"]),
  bl_number: z.string().trim().max(100).optional(),
  awb_number: z.string().trim().max(100).optional(),
  container_numbers_raw: z.string().max(500).optional(),
  clearance_date: z.string().optional(),
  delivery_date: z.string().optional(),
  officer_in_charge: z.string().trim().min(1, "Officer is required").max(200),
  total_revenue: z.coerce.number().min(0).optional(),
  total_expenses: z.coerce.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

export function NewConsignmentForm({ onSuccess }: { onSuccess: () => void }) {
  const createMutation = useCreateConsignment();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { shipment_type: "sea" },
  });

  const shipmentType = watch("shipment_type");

  const onSubmit = (data: FormData) => {
    const containers = data.container_numbers_raw
      ? data.container_numbers_raw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    createMutation.mutate(
      {
        client_name: data.client_name,
        shipment_type: data.shipment_type,
        bl_number: data.bl_number || null,
        awb_number: data.awb_number || null,
        container_numbers: containers,
        clearance_date: data.clearance_date || null,
        delivery_date: data.delivery_date || null,
        officer_in_charge: data.officer_in_charge,
        total_revenue: data.total_revenue || 0,
        total_expenses: data.total_expenses || 0,
        notes: data.notes || null,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Client Name *</Label>
          <Input {...register("client_name")} placeholder="e.g. Melcom Group" />
          {errors.client_name && <p className="text-xs text-destructive mt-1">{errors.client_name.message}</p>}
        </div>

        <div>
          <Label>Shipment Type *</Label>
          <Select value={shipmentType} onValueChange={(v) => setValue("shipment_type", v as "sea" | "air")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sea">Sea Freight</SelectItem>
              <SelectItem value="air">Air Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{shipmentType === "sea" ? "BL Number" : "AWB Number"}</Label>
          {shipmentType === "sea" ? (
            <Input {...register("bl_number")} placeholder="e.g. MSKU1234567" />
          ) : (
            <Input {...register("awb_number")} placeholder="e.g. 176-12345678" />
          )}
        </div>

        <div className="col-span-2">
          <Label>Container Numbers (comma-separated)</Label>
          <Input {...register("container_numbers_raw")} placeholder="e.g. MSKU1234567, TCLU7654321" />
        </div>

        <div>
          <Label>Clearance Date</Label>
          <Input type="date" {...register("clearance_date")} />
        </div>
        <div>
          <Label>Delivery Date</Label>
          <Input type="date" {...register("delivery_date")} />
        </div>

        <div className="col-span-2">
          <Label>Officer in Charge *</Label>
          <Input {...register("officer_in_charge")} placeholder="e.g. Kwame Asante" />
          {errors.officer_in_charge && <p className="text-xs text-destructive mt-1">{errors.officer_in_charge.message}</p>}
        </div>

        <div>
          <Label>Total Revenue (GHS)</Label>
          <Input type="number" step="0.01" {...register("total_revenue")} placeholder="0.00" />
        </div>
        <div>
          <Label>Total Expenses (GHS)</Label>
          <Input type="number" step="0.01" {...register("total_expenses")} placeholder="0.00" />
        </div>

        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Archive Consignment"}
      </Button>
    </form>
  );
}
