import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TruckIcon, User, MapPin, DollarSign, FileText, Loader2, Navigation } from "lucide-react";

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
  driver_phone: "",
  driver_license: "",
  container_number: "",
  bl_number: "",
  customer: "",
  origin: "",
  destination: "",
  pickup_date: "",
  delivery_date: "",
  cost_per_km: "",
  fuel_cost: "",
  driver_payment: "",
  toll_cost: "",
  misc_cost: "",
  advance_deposit: "",
  notes: "",
};

interface RouteData {
  pickup: { lat: number; lng: number; display_name: string };
  delivery: { lat: number; lng: number; display_name: string };
  distance_km: number;
  eta_seconds: number;
  polyline: [number, number][];
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      <Icon className="h-4 w-4" />
      {title}
    </div>
  );
}

function formatEta(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function NewTripDialog({ open, onOpenChange, trucks, drivers }: NewTripDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, company_name")
        .eq("is_active", true)
        .order("company_name");
      if (error) throw error;
      return data || [];
    },
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleDriverSelect = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      setForm((f) => ({
        ...f,
        driver_id: driverId,
        driver_phone: driver.phone,
        driver_license: driver.licenseNumber,
      }));
    }
  };

  // Auto-route when both origin & destination filled (debounced)
  useEffect(() => {
    if (!form.origin || !form.destination) {
      setRoute(null);
      setRouteError(null);
      return;
    }
    const t = setTimeout(async () => {
      setRouting(true);
      setRouteError(null);
      try {
        const { data, error } = await supabase.functions.invoke("trip-routing", {
          body: { pickup: form.origin, delivery: form.destination },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setRoute(data as RouteData);
      } catch (err: any) {
        setRoute(null);
        setRouteError(err.message || "Could not calculate route");
      } finally {
        setRouting(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [form.origin, form.destination]);

  // Auto-calculate trip cost when route or cost inputs change
  const computedTripCost =
    (route ? Number(form.cost_per_km || 0) * route.distance_km : 0) +
    Number(form.fuel_cost || 0) +
    Number(form.driver_payment || 0) +
    Number(form.toll_cost || 0) +
    Number(form.misc_cost || 0);

  const mutation = useMutation({
    mutationFn: async () => {
      const selectedDriver = drivers.find((d) => d.id === form.driver_id);
      const eta = route?.eta_seconds ?? null;
      const estimatedDelivery =
        eta && form.pickup_date
          ? new Date(new Date(form.pickup_date).getTime() + eta * 1000).toISOString()
          : null;

      const payload: any = {
        truck_id: form.truck_id,
        driver_id: form.driver_id,
        driver_name: selectedDriver?.name || null,
        driver_phone: selectedDriver?.phone || form.driver_phone || null,
        container_number: form.container_number || null,
        bl_number: form.bl_number || null,
        customer: form.customer || null,
        origin: form.origin,
        destination: form.destination,
        pickup_date: form.pickup_date || null,
        delivery_date: form.delivery_date || null,
        trip_cost: Number(computedTripCost.toFixed(2)),
        cost_per_km: Number(form.cost_per_km) || 0,
        fuel_cost: Number(form.fuel_cost) || 0,
        driver_payment: Number(form.driver_payment) || 0,
        toll_cost: Number(form.toll_cost) || 0,
        misc_cost: Number(form.misc_cost) || 0,
        advance_deposit: Number(form.advance_deposit) || 0,
        notes: form.notes || null,
        status: "scheduled",
      };

      if (route) {
        payload.pickup_lat = route.pickup.lat;
        payload.pickup_lng = route.pickup.lng;
        payload.delivery_lat = route.delivery.lat;
        payload.delivery_lng = route.delivery.lng;
        payload.pickup_location = route.pickup.display_name;
        payload.delivery_location = route.delivery.display_name;
        payload.distance_km = Number(route.distance_km.toFixed(2));
        payload.route_eta_seconds = route.eta_seconds;
        payload.route_polyline = JSON.stringify(route.polyline);
        payload.estimated_delivery_time = estimatedDelivery;
      }

      const { error } = await supabase.from("trucking_trips").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Trip created successfully");
      onOpenChange(false);
      setForm(INITIAL_FORM);
      setRoute(null);
    },
    onError: (err: any) => {
      toast.error("Failed to create trip: " + err.message);
    },
  });

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
              <Select value={form.truck_id} onValueChange={(v) => setForm((f) => ({ ...f, truck_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.registrationNumber} {t.status !== "available" ? `(${t.status})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Driver *</Label>
              <Select value={form.driver_id} onValueChange={handleDriverSelect}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} {d.status !== "available" ? `(${d.status})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Driver's Number</Label>
              <Input value={form.driver_phone} readOnly className="bg-muted/50" placeholder="Auto-filled from driver" />
            </div>
            <div className="space-y-1.5">
              <Label>License Number</Label>
              <Input value={form.driver_license} readOnly className="bg-muted/50" placeholder="Auto-filled from driver" />
            </div>
          </div>

          <Separator />

          {/* Customer & Cargo */}
          <SectionHeader icon={User} title="Customer & Cargo" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select value={form.customer} onValueChange={(v) => setForm((f) => ({ ...f, customer: v }))}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.company_name}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Pickup Location *</Label>
              <Input value={form.origin} onChange={set("origin")} placeholder="e.g. Tema Port, Ghana" />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Location *</Label>
              <Input value={form.destination} onChange={set("destination")} placeholder="e.g. Kumasi, Ghana" />
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

          {/* Route calculation result */}
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            {routing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating route via OpenStreetMap…
              </div>
            )}
            {!routing && route && (
              <div className="flex flex-wrap items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <Badge variant="secondary">Distance: {route.distance_km.toFixed(1)} km</Badge>
                <Badge variant="secondary">ETA: {formatEta(route.eta_seconds)}</Badge>
                <span className="text-xs text-muted-foreground">
                  Route auto-saved. Visible on live tracking map.
                </span>
              </div>
            )}
            {!routing && routeError && (
              <span className="text-xs text-destructive">⚠ {routeError}</span>
            )}
            {!routing && !route && !routeError && (
              <span className="text-xs text-muted-foreground">
                Enter pickup & delivery to auto-calculate distance and ETA.
              </span>
            )}
          </div>

          <Separator />

          {/* Financials — Trip Cost Identity */}
          <SectionHeader icon={DollarSign} title="Trip Cost Identity (GHS)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Cost per KM</Label>
              <Input type="number" value={form.cost_per_km} onChange={set("cost_per_km")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Fuel Cost</Label>
              <Input type="number" value={form.fuel_cost} onChange={set("fuel_cost")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Driver Payment</Label>
              <Input type="number" value={form.driver_payment} onChange={set("driver_payment")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Tolls</Label>
              <Input type="number" value={form.toll_cost} onChange={set("toll_cost")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Miscellaneous</Label>
              <Input type="number" value={form.misc_cost} onChange={set("misc_cost")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Advance/Deposit</Label>
              <Input type="number" value={form.advance_deposit} onChange={set("advance_deposit")} placeholder="0.00" />
            </div>
          </div>
          <div className="rounded-md border bg-primary/5 px-3 py-2 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">
              {route ? `(${Number(form.cost_per_km || 0)} × ${route.distance_km.toFixed(1)} km) + expenses` : "Add a route + cost per km to auto-compute"}
            </span>
            <span className="font-bold text-lg text-primary">
              GHS {computedTripCost.toFixed(2)}
            </span>
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
