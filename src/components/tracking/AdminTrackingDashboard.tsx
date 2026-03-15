import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Navigation, Truck, Copy, ExternalLink, Eye, Search, Radio } from "lucide-react";
import { useTrackingTrips, useActivateTracking } from "@/hooks/useTracking";
import { TrackingTrip } from "@/types/tracking";
import { DriverDashboard } from "./DriverDashboard";
import { SimulatedMap } from "./SimulatedMap";
import { toast } from "sonner";

export function AdminTrackingDashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<TrackingTrip | null>(null);
  const [driverView, setDriverView] = useState<TrackingTrip | null>(null);
  const { data: trips = [], isLoading } = useTrackingTrips(statusFilter);
  const activateTracking = useActivateTracking();

  const filtered = trips.filter(
    (t) =>
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.containerNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      t.truckNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const activeTrips = trips.filter((t) => t.status === "in-transit").length;
  const pendingTrips = trips.filter((t) => t.status === "scheduled" || t.status === "arrived_at_pickup").length;
  const completedTrips = trips.filter((t) => t.status === "delivered" || t.status === "completed").length;

  const copyTrackingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied!");
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-muted text-muted-foreground",
      arrived_at_pickup: "bg-amber-500/20 text-amber-700",
      "in-transit": "bg-blue-500/20 text-blue-700",
      delivered: "bg-green-500/20 text-green-700",
      completed: "bg-green-500/20 text-green-700",
    };
    return (
      <Badge className={colors[status] || "bg-muted"}>
        {status.replace(/_/g, " ").replace(/-/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">SLAC Live Truck Tracking</h1>
        <p className="text-sm text-muted-foreground">Real-time fleet monitoring and delivery tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1">{activeTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{pendingTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{completedTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{trips.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Map Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fleet Overview Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          <SimulatedMap
            tripStatus={activeTrips > 0 ? "in-transit" : "scheduled"}
            origin="Tema Port"
            destination="Accra"
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.customer}</TableCell>
                    <TableCell>{trip.containerNumber || "—"}</TableCell>
                    <TableCell className="text-sm">
                      <div>{trip.origin}</div>
                      <div className="text-muted-foreground">→ {trip.destination}</div>
                    </TableCell>
                    <TableCell>{trip.driverName || "—"}</TableCell>
                    <TableCell>{statusBadge(trip.status)}</TableCell>
                    <TableCell>
                      {trip.trackingUrl ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyTrackingLink(trip.trackingUrl!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => window.open(trip.trackingUrl!, "_blank")}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateTracking.mutate(trip.id)}
                          disabled={activateTracking.isPending}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDriverView(trip)}
                        >
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

      {/* Trip Detail Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trip Details</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer</span><p className="font-medium">{selectedTrip.customer}</p></div>
                <div><span className="text-muted-foreground">Container</span><p className="font-medium">{selectedTrip.containerNumber || "N/A"}</p></div>
                <div><span className="text-muted-foreground">Driver</span><p className="font-medium">{selectedTrip.driverName || "N/A"}</p></div>
                <div><span className="text-muted-foreground">Truck</span><p className="font-medium">{selectedTrip.truckNumber || "N/A"}</p></div>
                <div><span className="text-muted-foreground">Origin</span><p className="font-medium">{selectedTrip.origin}</p></div>
                <div><span className="text-muted-foreground">Destination</span><p className="font-medium">{selectedTrip.destination}</p></div>
                <div><span className="text-muted-foreground">Status</span>{statusBadge(selectedTrip.status)}</div>
                <div><span className="text-muted-foreground">Distance</span><p className="font-medium">{selectedTrip.distanceKm} km</p></div>
              </div>
              {selectedTrip.trackingUrl && (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <p className="text-muted-foreground mb-1">Tracking Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs flex-1 truncate">{selectedTrip.trackingUrl}</code>
                    <Button variant="outline" size="sm" onClick={() => copyTrackingLink(selectedTrip.trackingUrl!)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {selectedTrip.deliveryOtp && (
                <div className="bg-amber-50 p-3 rounded text-sm text-center">
                  <p className="text-muted-foreground mb-1">Delivery OTP</p>
                  <p className="text-xl font-bold tracking-widest text-amber-700">{selectedTrip.deliveryOtp}</p>
                </div>
              )}
            </div>
          )}
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
