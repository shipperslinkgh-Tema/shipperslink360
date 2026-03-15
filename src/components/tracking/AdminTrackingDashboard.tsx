import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Truck, Copy, ExternalLink, Eye, Search, Radio, Clock, Package, User, Phone, Route, Gauge, Calendar, CheckCircle, MessageCircle } from "lucide-react";
import { useTrackingTrips, useActivateTracking, useGpsLogs, useLatestGps } from "@/hooks/useTracking";
import { TrackingTrip } from "@/types/tracking";
import { DriverDashboard } from "./DriverDashboard";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  scheduled:          { label: "Scheduled",      color: "bg-muted text-muted-foreground",     dot: "bg-muted-foreground" },
  arrived_at_pickup:  { label: "At Pickup",      color: "bg-warning/15 text-warning",         dot: "bg-warning" },
  "in-transit":       { label: "In Transit",     color: "bg-info/15 text-info",               dot: "bg-info" },
  delivered:          { label: "Delivered",       color: "bg-success/15 text-success",         dot: "bg-success" },
  completed:          { label: "Completed",       color: "bg-success/15 text-success",         dot: "bg-success" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <Badge className={cn("gap-1.5", cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

function TripTimeline({ trip }: { trip: TrackingTrip }) {
  const steps = [
    { key: "scheduled", label: "Scheduled", time: trip.pickupDate, icon: Calendar },
    { key: "arrived_at_pickup", label: "At Pickup", time: trip.arrivedAtPickupTime, icon: MapPin },
    { key: "in-transit", label: "In Transit", time: trip.actualStartTime, icon: Navigation },
    { key: "delivered", label: "Delivered", time: trip.actualEndTime, icon: CheckCircle },
  ];

  const statusOrder = ["scheduled", "arrived_at_pickup", "in-transit", "delivered", "completed"];
  const currentIdx = statusOrder.indexOf(trip.status);

  return (
    <div className="space-y-1">
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = statusOrder[idx] === trip.status;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                isCurrent ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30" :
                isCompleted ? "bg-success text-success-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-0.5 h-6 my-1",
                  isCompleted ? "bg-success" : "bg-muted"
                )} />
              )}
            </div>
            <div className="pt-1">
              <p className={cn("text-sm", isCompleted ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {step.label}
              </p>
              {step.time && (
                <p className="text-xs text-muted-foreground">
                  {new Date(step.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TripDetailPanel({ trip, onClose }: { trip: TrackingTrip; onClose: () => void }) {
  const { data: gpsLogs = [] } = useGpsLogs(trip.id);
  const { data: latestGps } = useLatestGps(trip.trackingActive ? trip.id : undefined);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied!");
  };

  let etaText = "—";
  if (trip.estimatedDeliveryTime) {
    const diff = new Date(trip.estimatedDeliveryTime).getTime() - Date.now();
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      etaText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
    } else etaText = "Arriving soon";
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <LiveTrackingMap
        gpsLogs={gpsLogs}
        latestGps={latestGps}
        tripStatus={trip.status}
        origin={trip.pickupLocation || trip.origin}
        destination={trip.deliveryLocation || trip.destination}
        className="h-56 rounded-lg overflow-hidden"
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Trip Timeline</h4>
          <TripTimeline trip={trip} />
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Container:</span>
              <span className="font-medium font-mono">{trip.containerNumber || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-medium">{trip.driverName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Truck:</span>
              <span className="font-medium">{trip.truckNumber || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">{trip.distanceKm} km</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ETA:</span>
              <span className="font-semibold text-primary">{etaText}</span>
            </div>
            {latestGps && latestGps.speed > 0 && (
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Speed:</span>
                <span className="font-medium">{latestGps.speed.toFixed(0)} km/h</span>
              </div>
            )}
          </div>

          {trip.trackingUrl && (
            <div className="rounded-lg bg-muted/50 p-3 mt-2">
              <p className="text-xs text-muted-foreground mb-1">Tracking Link</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] flex-1 truncate text-foreground">{trip.trackingUrl}</code>
                <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyLink(trip.trackingUrl!)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {trip.deliveryOtp && (
            <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Delivery OTP</p>
              <p className="text-xl font-bold tracking-[0.3em] text-warning">{trip.deliveryOtp}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminTrackingDashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<TrackingTrip | null>(null);
  const [driverView, setDriverView] = useState<TrackingTrip | null>(null);
  const [activeTab, setActiveTab] = useState("fleet");
  const { data: trips = [], isLoading } = useTrackingTrips(statusFilter);
  const activateTracking = useActivateTracking();

  const filtered = trips.filter(
    (t) =>
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.containerNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      t.truckNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const activeTrips = trips.filter((t) => t.status === "in-transit");
  const pendingTrips = trips.filter((t) => t.status === "scheduled" || t.status === "arrived_at_pickup");
  const completedTrips = trips.filter((t) => t.status === "delivered" || t.status === "completed");

  const copyTrackingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied!");
  };

  // Build fleet positions for map from active trips' simulated positions
  const fleetPositions = activeTrips.map((t, i) => ({
    id: t.id,
    lat: 5.6037 + (Math.random() - 0.5) * 0.08,
    lng: -0.1870 + (Math.random() - 0.5) * 0.12,
    label: `${t.truckNumber || "Truck"} → ${t.customer}`,
    status: t.status,
  }));

  const stats = [
    { label: "In Transit", value: activeTrips.length, icon: Radio, color: "text-info", bg: "bg-info/10" },
    { label: "Pending", value: pendingTrips.length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Completed", value: completedTrips.length, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    { label: "Total Trips", value: trips.length, icon: Truck, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SLAC Live Truck Tracking</h1>
          <p className="text-sm text-muted-foreground">Real-time fleet monitoring and delivery tracking</p>
        </div>
        {activeTrips.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-info/10 text-info text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-info animate-pulse" />
            {activeTrips.length} live
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className={cn("rounded-lg p-2", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fleet" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Fleet Map
          </TabsTrigger>
          <TabsTrigger value="trips" className="gap-1.5">
            <Truck className="h-3.5 w-3.5" /> All Trips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Fleet Overview
                {activeTrips.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{activeTrips.length} active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-lg">
              <LiveTrackingMap
                tripStatus="in-transit"
                origin="Tema Port"
                destination="Accra"
                className="h-[400px]"
                fleetPositions={fleetPositions.length > 0 ? fleetPositions : undefined}
              />
            </CardContent>
          </Card>

          {/* Active Trips Quick View */}
          {activeTrips.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {activeTrips.map(trip => (
                <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTrip(trip)}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{trip.customer}</span>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3 w-3" />
                        {trip.truckNumber || "N/A"} • {trip.driverName || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Route className="h-3 w-3" />
                        {trip.origin} → {trip.destination}
                      </div>
                      {trip.containerNumber && (
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3 w-3" />
                          <span className="font-mono">{trip.containerNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trips" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="arrived_at_pickup">At Pickup</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trips Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver / Truck</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No trips found</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((trip) => (
                      <TableRow key={trip.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{trip.customer}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{trip.containerNumber || "—"}</span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-success">●</span> {trip.origin}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="text-destructive">●</span> {trip.destination}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{trip.driverName || "—"}</p>
                            <p className="text-xs text-muted-foreground">{trip.truckNumber || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={trip.status} /></TableCell>
                        <TableCell>
                          {trip.trackingUrl ? (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyTrackingLink(trip.trackingUrl!)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(trip.trackingUrl!, "_blank")}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => activateTracking.mutate(trip.id)} disabled={activateTracking.isPending}>
                              Activate
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrip(trip)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setDriverView(trip)}>
                              Driver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trip Detail Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Trip Details
              {selectedTrip && <StatusBadge status={selectedTrip.status} />}
            </DialogTitle>
          </DialogHeader>
          {selectedTrip && <TripDetailPanel trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
        </DialogContent>
      </Dialog>

      {/* Driver View Dialog */}
      <Dialog open={!!driverView} onOpenChange={() => setDriverView(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Interface</DialogTitle>
          </DialogHeader>
          {driverView && <DriverDashboard trip={driverView} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
