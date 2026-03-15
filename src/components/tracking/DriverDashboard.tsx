import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Navigation, Phone, Package, CheckCircle, Play, Square, Clock, Truck } from "lucide-react";
import { TrackingTrip } from "@/types/tracking";
import { useUpdateTripStatus, useRecordGps, useEndTrip } from "@/hooks/useTracking";

interface Props {
  trip: TrackingTrip;
}

export function DriverDashboard({ trip }: Props) {
  const updateStatus = useUpdateTripStatus();
  const recordGps = useRecordGps();
  const endTrip = useEndTrip();
  const [gpsActive, setGpsActive] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // Simulated GPS recording
  const recordPosition = useCallback(() => {
    if (!gpsActive) return;
    // In production, use navigator.geolocation
    // For now, simulate with Accra coordinates + slight variation
    const baseLat = 5.6037;
    const baseLng = -0.1870;
    recordGps.mutate({
      tripId: trip.id,
      latitude: baseLat + (Math.random() - 0.5) * 0.05,
      longitude: baseLng + (Math.random() - 0.5) * 0.05,
      speed: Math.random() * 60 + 20,
      heading: Math.random() * 360,
      accuracy: 10,
    });
  }, [gpsActive, trip.id, recordGps]);

  useEffect(() => {
    if (!gpsActive) return;
    const interval = setInterval(recordPosition, 10000);
    return () => clearInterval(interval);
  }, [gpsActive, recordPosition]);

  const handleArrivedAtPickup = () => {
    updateStatus.mutate({
      tripId: trip.id,
      status: "arrived_at_pickup",
      extraData: { arrived_at_pickup_time: new Date().toISOString() },
    });
  };

  const handleStartTrip = () => {
    setGpsActive(true);
    updateStatus.mutate({
      tripId: trip.id,
      status: "in-transit",
      extraData: { actual_start_time: new Date().toISOString() },
    });
    // Record initial position
    setTimeout(recordPosition, 500);
  };

  const handleEndTrip = () => {
    setOtpDialog(true);
  };

  const confirmEndTrip = () => {
    setGpsActive(false);
    endTrip.mutate({
      tripId: trip.id,
      otp: otpInput || undefined,
      confirmedBy: "driver",
    });
    setOtpDialog(false);
    setOtpInput("");
  };

  const statusColor: Record<string, string> = {
    scheduled: "bg-muted text-muted-foreground",
    arrived_at_pickup: "bg-amber-500/20 text-amber-700",
    "in-transit": "bg-blue-500/20 text-blue-700",
    delivered: "bg-green-500/20 text-green-700",
    completed: "bg-green-500/20 text-green-700",
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Trip Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Active Trip
            </CardTitle>
            <Badge className={statusColor[trip.status] || "bg-muted"}>
              {trip.status.replace(/_/g, " ").replace(/-/g, " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Container</span>
              <p className="font-medium">{trip.containerNumber || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Truck</span>
              <p className="font-medium">{trip.truckNumber || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Pickup</span>
                <p className="font-medium">{trip.pickupLocation || trip.origin}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Delivery</span>
                <p className="font-medium">{trip.deliveryLocation || trip.destination}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card>
        <CardContent className="pt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Client:</span>
            <span className="font-medium">{trip.customer}</span>
          </div>
          {trip.customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${trip.customerPhone}`} className="text-primary underline">{trip.customerPhone}</a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Cargo:</span>
            <span>{trip.cargoDescription || "General cargo"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {trip.status === "scheduled" && (
          <Button
            className="w-full h-14 text-lg bg-amber-600 hover:bg-amber-700"
            onClick={handleArrivedAtPickup}
            disabled={updateStatus.isPending}
          >
            <MapPin className="h-5 w-5 mr-2" />
            ARRIVED AT PICKUP
          </Button>
        )}

        {(trip.status === "scheduled" || trip.status === "arrived_at_pickup") && (
          <Button
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
            onClick={handleStartTrip}
            disabled={updateStatus.isPending}
          >
            <Play className="h-5 w-5 mr-2" />
            START TRIP
          </Button>
        )}

        {trip.status === "in-transit" && (
          <>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              GPS tracking active
            </div>
            <Button
              className="w-full h-14 text-lg bg-destructive hover:bg-destructive/90"
              onClick={handleEndTrip}
              disabled={endTrip.isPending}
            >
              <Square className="h-5 w-5 mr-2" />
              END TRIP
            </Button>
          </>
        )}

        {(trip.status === "delivered" || trip.status === "completed") && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Trip Completed</span>
          </div>
        )}
      </div>

      {/* OTP Confirmation Dialog */}
      <Dialog open={otpDialog} onOpenChange={setOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter the delivery OTP from the customer to confirm delivery, or leave blank to skip verification.
          </p>
          <Input
            placeholder="Enter 6-digit OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtpDialog(false)}>Cancel</Button>
            <Button onClick={confirmEndTrip} disabled={endTrip.isPending}>
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
