import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Ship, Search, MapPin, Calendar, Package, Anchor,
  CheckCircle, Clock, AlertTriangle, Truck, FileText, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle; step: number }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock, step: 0 },
  in_transit: { label: "In Transit", color: "bg-primary/10 text-primary", icon: Ship, step: 1 },
  at_port: { label: "At Port", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Anchor, step: 2 },
  customs_clearance: { label: "Customs Clearance", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: FileText, step: 3 },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle, step: 4 },
  on_hold: { label: "On Hold", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle, step: -1 },
};

const TRACKING_STAGES = [
  { key: "pending", label: "Booked", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Ship },
  { key: "at_port", label: "Arrived at Port", icon: Anchor },
  { key: "customs_clearance", label: "Customs Clearance", icon: FileText },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function ClientShipments() {
  const { clientProfile } = useClientAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  useEffect(() => {
    if (!clientProfile) return;
    const fetchShipments = async () => {
      const { data } = await supabase
        .from("client_shipments")
        .select("*")
        .eq("customer_id", clientProfile.customer_id)
        .order("created_at", { ascending: false });
      setShipments(data || []);
      setLoading(false);
    };
    fetchShipments();

    // Realtime updates
    const channel = supabase
      .channel("client-shipments-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "client_shipments",
        filter: `customer_id=eq.${clientProfile.customer_id}`,
      }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setShipments(prev => prev.map(s => s.id === (payload.new as any).id ? payload.new : s));
          if (selectedShipment?.id === (payload.new as any).id) {
            setSelectedShipment(payload.new);
          }
        } else if (payload.eventType === "INSERT") {
          setShipments(prev => [payload.new as any, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientProfile]);

  const filtered = shipments.filter(s =>
    s.bl_number.toLowerCase().includes(search.toLowerCase()) ||
    (s.container_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.vessel_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.cargo_description || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = shipments.filter(s => s.status !== "delivered").length;
  const deliveredCount = shipments.filter(s => s.status === "delivered").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" /> My Shipments
          </h1>
          <p className="text-muted-foreground text-sm">Track all your shipments in real-time</p>
        </div>
        <div className="flex gap-3">
          <Card className="px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground">Active</p>
            <p className="text-lg font-bold text-primary">{activeCount}</p>
          </Card>
          <Card className="px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground">Delivered</p>
            <p className="text-lg font-bold text-emerald-600">{deliveredCount}</p>
          </Card>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by BL, container, vessel, or cargo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading shipments...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No shipments found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => {
            const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={s.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => setSelectedShipment(s)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">{s.bl_number}</span>
                    <Badge className={cn("gap-1 border-0", cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>

                  {s.container_number && (
                    <p className="text-xs text-muted-foreground font-mono">📦 {s.container_number}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{s.origin}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{s.destination}</span>
                  </div>

                  {s.vessel_name && (
                    <p className="text-xs text-muted-foreground">
                      <Ship className="h-3 w-3 inline mr-1" />{s.vessel_name} {s.voyage_number ? `/ ${s.voyage_number}` : ""}
                    </p>
                  )}

                  {/* Mini progress tracker */}
                  <div className="flex items-center gap-1 pt-1">
                    {TRACKING_STAGES.map((stage, idx) => {
                      const currentStep = cfg.step;
                      const isComplete = currentStep >= idx;
                      const isCurrent = currentStep === idx;
                      return (
                        <div key={stage.key} className="flex items-center flex-1">
                          <div className={cn(
                            "h-1.5 w-full rounded-full transition-colors",
                            isComplete ? "bg-primary" : "bg-muted"
                          )} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{s.eta ? `ETA: ${new Date(s.eta).toLocaleDateString()}` : ""}</span>
                    <span>{s.cargo_description ? s.cargo_description.slice(0, 30) : ""}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Shipment Detail Dialog */}
      <Dialog open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipment(null)}>
        <DialogContent className="max-w-lg">
          {selectedShipment && <ShipmentDetail shipment={selectedShipment} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShipmentDetail({ shipment }: { shipment: any }) {
  const cfg = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.pending;
  const currentStep = cfg.step;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="font-mono">{shipment.bl_number}</DialogTitle>
          <Badge className={cn("gap-1 border-0", cfg.color)}>
            <cfg.icon className="h-3 w-3" />
            {cfg.label}
          </Badge>
        </div>
      </DialogHeader>

      {/* Visual Stage Tracker */}
      <div className="space-y-1 py-4">
        {TRACKING_STAGES.map((stage, idx) => {
          const isComplete = currentStep > idx;
          const isCurrent = currentStep === idx;
          const StageIcon = stage.icon;
          return (
            <div key={stage.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isComplete ? "bg-primary border-primary text-primary-foreground" :
                  isCurrent ? "border-primary text-primary bg-primary/10" :
                  "border-muted-foreground/30 text-muted-foreground/50"
                )}>
                  <StageIcon className="h-4 w-4" />
                </div>
                {idx < TRACKING_STAGES.length - 1 && (
                  <div className={cn("w-0.5 h-6", isComplete ? "bg-primary" : "bg-muted")} />
                )}
              </div>
              <div className="pt-1">
                <p className={cn("text-sm font-medium", isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground")}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground mt-0.5">Current status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Shipment Details */}
      <div className="grid grid-cols-2 gap-3 py-3 text-sm">
        <DetailRow label="Container" value={shipment.container_number} />
        <DetailRow label="Vessel" value={shipment.vessel_name} />
        <DetailRow label="Voyage" value={shipment.voyage_number} />
        <DetailRow label="Origin" value={shipment.origin} />
        <DetailRow label="Destination" value={shipment.destination} />
        <DetailRow label="Weight" value={shipment.weight_kg ? `${shipment.weight_kg} kg` : null} />
        <DetailRow label="ETA" value={shipment.eta ? new Date(shipment.eta).toLocaleDateString() : null} />
        <DetailRow label="ATA" value={shipment.ata ? new Date(shipment.ata).toLocaleDateString() : null} />
      </div>

      {shipment.cargo_description && (
        <>
          <Separator />
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-1">Cargo Description</p>
            <p className="text-sm">{shipment.cargo_description}</p>
          </div>
        </>
      )}

      {shipment.notes && (
        <>
          <Separator />
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{shipment.notes}</p>
          </div>
        </>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
