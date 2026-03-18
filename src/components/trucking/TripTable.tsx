import { useState } from "react";
import { Trip, Truck, Driver } from "@/types/trucking";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Route, Calendar, DollarSign, Container, CheckCircle2, Clock, Copy, ExternalLink, Radio, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivateTracking, useTrackingTrips } from "@/hooks/useTracking";
import { toast } from "sonner";
import { ContainerReturnDialog } from "@/components/trucking/ContainerReturnDialog";

interface TripTableProps {
  trips: Trip[];
  trucks: Truck[];
  drivers: Driver[];
}

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-muted text-muted-foreground" },
  "in-transit": { label: "In Transit", className: "status-warning" },
  delivered: { label: "Delivered", className: "status-success" },
  completed: { label: "Completed", className: "bg-primary text-primary-foreground" },
};

export function TripTable({ trips, trucks, drivers }: TripTableProps) {
  const getTruck = (truckId: string) => trucks.find((t) => t.id === truckId);
  const getDriver = (driverId: string) => drivers.find((d) => d.id === driverId);
  const activateTracking = useActivateTracking();
  const { data: trackingTrips = [] } = useTrackingTrips();

  const getTrackingInfo = (tripId: string) =>
    trackingTrips.find((t) => t.id === tripId);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied!");
  };

  const shareWhatsApp = (url: string, customer: string) => {
    const msg = encodeURIComponent(
      `Hello ${customer}, here is your live shipment tracking link:\n${url}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Active Trips</h3>
        </div>
        <Badge variant="outline">{trips.length} Trips</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Container / BL</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Truck / Driver</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Container Return</TableHead>
              <TableHead className="text-right">Payment (GHS)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => {
              const truck = getTruck(trip.truckId);
              const driver = getDriver(trip.driverId);
              const status = statusConfig[trip.status];
              const tracking = getTrackingInfo(trip.id);

              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Container className="h-3 w-3 text-muted-foreground" />
                        {trip.containerNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">{trip.blNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>{trip.customer}</TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[180px]">
                      <div className="text-xs text-muted-foreground">From: {trip.origin}</div>
                      <div className="text-xs font-medium">To: {trip.destination}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{truck?.registrationNumber || "-"}</div>
                      <div className="text-xs text-muted-foreground">{driver?.name || "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {trip.pickupDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    {trip.deliveryDate ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-status-success" />
                        {trip.deliveryDate}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {trip.containerReturned ? (
                        <div className="flex items-center gap-1 text-sm text-status-success">
                          <CheckCircle2 className="h-3 w-3" />
                          {trip.containerReturnDate}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-status-warning">
                          <Clock className="h-3 w-3" />
                          Pending
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {trip.containerReturnLocation}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-1 text-sm font-medium">
                        <DollarSign className="h-3 w-3 text-status-success" />
                        {trip.tripCost.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Driver: {trip.driverPayment.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fuel: {trip.fuelCost.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", status.className)}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {tracking?.trackingUrl ? (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Copy link" onClick={() => copyLink(tracking.trackingUrl!)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" title="Share via WhatsApp" onClick={() => shareWhatsApp(tracking.trackingUrl!, trip.customer)}>
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Open link" onClick={() => window.open(tracking.trackingUrl!, "_blank")}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => activateTracking.mutate(trip.id)}
                        disabled={activateTracking.isPending}
                      >
                        <Radio className="h-3 w-3" />
                        Activate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
