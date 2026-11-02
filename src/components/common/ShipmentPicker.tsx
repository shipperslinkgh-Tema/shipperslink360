import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";

export interface PickedShipment {
  id: string;
  consignment_ref: string;
  client_name: string;
  client_id: string | null;
  bl_number: string | null;
  awb_number: string | null;
  container_number: string | null;
  shipping_line: string | null;
  eta: string | null;
  free_days: number | null;
  vessel_name: string | null;
  port_of_discharge: string | null;
  cargo_description: string | null;
  customer?: { id: string; company_name: string; address: string | null; city: string | null; phone: string | null } | null;
}

/** Pick an existing shipment so a form can auto-fill its details instead of retyping them. */
export function useShipmentOptions() {
  return useQuery({
    queryKey: ["shipment-picker-options"],
    queryFn: async () => {
      const [{ data: ships, error }, { data: custs }] = await Promise.all([
        supabase
          .from("consignment_workflows")
          .select("id, consignment_ref, client_name, client_id, bl_number, awb_number, container_number, shipping_line, eta, free_days, vessel_name, port_of_discharge, cargo_description")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase.from("customers").select("id, company_name, address, city, phone, customer_code"),
      ]);
      if (error) throw error;
      return (ships || []).map((s) => {
        const name = (s.client_name || "").trim().toLowerCase();
        const customer =
          (custs || []).find((c) => c.id === s.client_id || (s.client_id && c.customer_code === s.client_id)) ||
          (custs || []).find((c) => c.company_name.trim().toLowerCase() === name) ||
          null;
        return { ...s, customer } as PickedShipment;
      });
    },
  });
}

export function ShipmentPicker({ onPick, label = "Fill from existing shipment" }: { onPick: (s: PickedShipment) => void; label?: string }) {
  const { data = [], isLoading } = useShipmentOptions();
  return (
    <div className="space-y-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
      <Label className="flex items-center gap-1.5 text-primary"><Wand2 className="h-3.5 w-3.5" />{label}</Label>
      <Select value="" onValueChange={(id) => { const s = data.find((x) => x.id === id); if (s) onPick(s); }}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder={isLoading ? "Loading…" : data.length ? "Choose shipment / BL — fields fill in, still editable" : "No shipments yet"} />
        </SelectTrigger>
        <SelectContent>
          {data.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.consignment_ref} · {s.client_name}{s.bl_number || s.awb_number ? ` · ${s.bl_number || s.awb_number}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
