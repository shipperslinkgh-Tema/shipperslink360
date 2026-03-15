import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Navigation, Phone, Package, CheckCircle, Play, Square, Clock, Truck, Camera, AlertTriangle } from "lucide-react";
import { TrackingTrip } from "@/types/tracking";
import { useUpdateTripStatus, useRecordGps, useEndTrip, useGpsLogs } from "@/hooks/useTracking";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { cn } from "@/lib/utils";

interface Props {
  trip: TrackingTrip;
}

export function DriverDashboard({ trip }: Props) {
  const updateStatus = useUpdateTripStatus();
  const recordGps = useRecordGps();
  const endTrip = useEndTrip();
  const { data: gpsLogs = [] } = useGpsLogs(trip.status === "in-transit" ? trip.id : undefined);
  const [gpsActive, setGpsActive] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");

  // Timer
  useEffect(() => {
    if (trip.status !== "in-transit" || !trip.actualStartTime) return;
    const update = () => {
      const diff = Date.now() - new Date(trip.actualStartTime!).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setElapsedTime(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
    };
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, [trip.status, trip.actualStartTime]);

  const recordPosition = useCallback(() => {
    if (!gpsActive) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          recordGps.mutate({
            tripId: trip.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: (pos.coords.speed || 0) * 3.6, // m/s to km/h
            heading: pos.coords.heading || 0,
            accuracy: pos.coords.accuracy || 0,
          });
        },
        () => {
          // Fallback to simulated position around Accra
          recordGps.mutate({
            tripId: trip.id,
            latitude: 5.6037 + (Math.random() - 0.5) * 0.05,
            longitude: -0.1870 + (Math.random() - 0.5) * 0.05,
            speed: Math.random() * 60 + 20,
            heading: Math.random() * 360,
            accuracy: 15,
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
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
    setTimeout(recordPosition, 500);
  };

  const handleEndTrip = () => setOtpDialog(true);

  const confirmEndTrip = () => {
    setGpsActive(false);
    endTrip.mutate({ tripId: trip.id, otp: otpInput || undefined, confirmedBy: "driver" });
    setOtpDialog(false);
    setOtpInput("");
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled:         { label: "SCHEDULED", color: "bg-muted text-muted-foreground" },
    arrived_at_pickup: { label: "AT PICKUP", color: "bg-warning/20 text-warning" },
    "in-transit":      { label: "IN TRANSIT", color: "bg-info/20 text-info" },
    delivered:         { label: "DELIVERED", color: "bg-success/20 text-success" },
    completed:         { label: "COMPLETED", color: "bg-success/20 text-success" },
  };

  const cfg = statusConfig[trip.status] || statusConfig.scheduled;

  return (
    <div className="space-y-4 max-w-lg mx-auto px-1">
      {/* Trip Header */}
      <Card>
        <CardHeader className="pb-2 px-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Active Trip
            </CardTitle>
            <Badge className={cfg.color}>{cfg.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          {/* Trip elapsed time for in-transit */}
          {trip.status === "in-transit" && (
            <div className="flex items-center justify-between bg-info/5 rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-info animate-pulse" />
                <span className="text-sm font-medium text-info">GPS Tracking Active</span>
              </div>
              <span className="text-sm font-bold text-foreground">{elapsedTime}</span>
            </div>
          )}

          {/* Route info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-success flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-success-foreground" />
                </div>
                <div className="w-0.5 h-4 bg-border" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="font-medium">{trip.pickupLocation || trip.origin}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-destructive flex items-center justify-center">
                <Navigation className="h-3.5 w-3.5 text-destructive-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery</p>
                <p className="font-medium">{trip.deliveryLocation || trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Container</p>
              <p className="font-mono text-xs font-semibold truncate">{trip.containerNumber || "N/A"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Truck</p>
              <p className="text-xs font-semibold truncate">{trip.truckNumber || "N/A"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-xs font-semibold">{trip.distanceKm} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Map for in-transit */}
      {trip.status === "in-transit" && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <LiveTrackingMap
              gpsLogs={gpsLogs}
              tripStatus={trip.status}
              origin={trip.pickupLocation || trip.origin}
              destination={trip.deliveryLocation || trip.destination}
              className="h-48"
            />
          </CardContent>
        </Card>
      )}

      {/* Client Info */}
      <Card>
        <CardContent className="pt-4 space-y-2 text-sm px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium truncate">{trip.customer}</span>
            </div>
            {trip.customerPhone && (
              <a
                href={`tel:${trip.customerPhone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Cargo:</span>
            <span className="truncate">{trip.cargoDescription || "General cargo"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {trip.status === "scheduled" && (
          <Button
            className="w-full h-16 text-base bg-warning hover:bg-warning/90 text-warning-foreground rounded-xl touch-manipulation"
            onClick={handleArrivedAtPickup}
            disabled={updateStatus.isPending}
          >
            <MapPin className="h-6 w-6 mr-2" />
            ARRIVED AT PICKUP
          </Button>
        )}

        {(trip.status === "scheduled" || trip.status === "arrived_at_pickup") && (
          <Button
            className="w-full h-16 text-base bg-primary hover:bg-primary/90 rounded-xl touch-manipulation"
            onClick={handleStartTrip}
            disabled={updateStatus.isPending}
          >
            <Play className="h-6 w-6 mr-2" />
            START TRIP
          </Button>
        )}

        {trip.status === "in-transit" && (
          <Button
            className="w-full h-16 text-base bg-destructive hover:bg-destructive/90 rounded-xl touch-manipulation"
            onClick={handleEndTrip}
            disabled={endTrip.isPending}
          >
            <Square className="h-6 w-6 mr-2" />
            END TRIP & CONFIRM DELIVERY
          </Button>
        )}

        {(trip.status === "delivered" || trip.status === "completed") && (
          <div className="flex items-center justify-center gap-3 p-6 bg-success/10 rounded-xl">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <p className="font-bold text-success text-lg">Trip Completed</p>
              {trip.actualEndTime && (
                <p className="text-sm text-muted-foreground">
                  {new Date(trip.actualEndTime).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OTP Dialog */}
      <Dialog open={otpDialog} onOpenChange={setOtpDialog}>
        <DialogContent className="max-w-[92vw] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Delivery
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit OTP from the customer to confirm delivery, or skip to complete without verification.
          </p>
          <Input
            placeholder="Enter 6-digit OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-[0.3em] h-14 font-mono"
            inputMode="numeric"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOtpDialog(false)} className="h-12 touch-manipulation">Cancel</Button>
            <Button onClick={confirmEndTrip} disabled={endTrip.isPending} className="h-12 touch-manipulation">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
