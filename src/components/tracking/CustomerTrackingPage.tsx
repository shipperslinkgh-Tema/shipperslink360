import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, User, Clock, CheckCircle, Navigation, Package, Shield, Phone, Route } from "lucide-react";
import { TrackingTrip } from "@/types/tracking";
import { useAcceptDeliveryMonitoring, useLatestGps, useGpsLogs } from "@/hooks/useTracking";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { cn } from "@/lib/utils";

interface Props {
  trip: TrackingTrip;
}

export function CustomerTrackingPage({ trip }: Props) {
  const acceptMonitoring = useAcceptDeliveryMonitoring();
  const { data: latestGps } = useLatestGps(trip.trackingActive ? trip.id : undefined);
  const { data: gpsLogs = [] } = useGpsLogs(trip.trackingActive ? trip.id : undefined);

  const statusSteps = [
    { key: "scheduled", label: "Trip Scheduled", icon: Clock, subtitle: trip.pickupDate ? `Scheduled for ${new Date(trip.pickupDate).toLocaleDateString("en-GB", { dateStyle: "medium" })}` : undefined },
    { key: "arrived_at_pickup", label: "Arrived at Pickup", icon: MapPin, subtitle: trip.arrivedAtPickupTime ? new Date(trip.arrivedAtPickupTime).toLocaleTimeString("en-GB", { timeStyle: "short" }) : undefined },
    { key: "in-transit", label: "In Transit", icon: Navigation, subtitle: trip.actualStartTime ? `Started ${new Date(trip.actualStartTime).toLocaleTimeString("en-GB", { timeStyle: "short" })}` : undefined },
    { key: "delivered", label: "Delivered", icon: CheckCircle, subtitle: trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : undefined },
  ];

  const statusOrder = ["scheduled", "arrived_at_pickup", "in-transit", "delivered", "completed"];
  const currentStepIdx = statusOrder.indexOf(trip.status);

  let etaText = "Calculating...";
  let etaProgress = 0;
  if (trip.estimatedDeliveryTime) {
    const diff = new Date(trip.estimatedDeliveryTime).getTime() - Date.now();
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      etaText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} minutes`;
      // Rough progress
      const startTime = trip.actualStartTime ? new Date(trip.actualStartTime).getTime() : Date.now() - 3600000;
      const totalDuration = new Date(trip.estimatedDeliveryTime).getTime() - startTime;
      etaProgress = Math.min(95, Math.max(5, ((Date.now() - startTime) / totalDuration) * 100));
    } else {
      etaText = "Arriving soon";
      etaProgress = 95;
    }
  } else if (trip.status === "delivered" || trip.status === "completed") {
    etaText = "Delivered ✅";
    etaProgress = 100;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-medium opacity-80">SLAC Live Tracking</span>
          </div>
          <h1 className="text-xl font-bold">Delivery Tracking</h1>
          <p className="text-sm opacity-70 mt-0.5">Shippers Link Agencies Co., Ltd</p>

          {/* ETA Bar */}
          {trip.status === "in-transit" && (
            <div className="mt-4 bg-primary-foreground/10 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="opacity-80">Estimated Arrival</span>
                <span className="font-bold text-lg">{etaText}</span>
              </div>
              <div className="w-full h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-1000"
                  style={{ width: `${etaProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] opacity-60 mt-1">
                <span>{trip.origin}</span>
                <span>{trip.destination}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Accept Monitoring Banner */}
        {!trip.customerAccepted && trip.trackingActive && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 text-center space-y-3">
              <Shield className="h-8 w-8 text-primary mx-auto" />
              <p className="text-sm font-medium">Accept delivery monitoring to track your cargo in real-time</p>
              <Button className="w-full" onClick={() => acceptMonitoring.mutate(trip.id)} disabled={acceptMonitoring.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                ACCEPT DELIVERY MONITORING
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Live Map */}
        {(trip.customerAccepted || !trip.trackingActive) && trip.status !== "scheduled" && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <LiveTrackingMap
                gpsLogs={gpsLogs}
                latestGps={latestGps}
                tripStatus={trip.status}
                origin={trip.pickupLocation || trip.origin}
                destination={trip.deliveryLocation || trip.destination}
                className="h-56"
              />
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trip Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {statusSteps.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = statusOrder[idx] === trip.status;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all",
                        isCurrent ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110" :
                        isActive ? "bg-success text-success-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-8",
                          isActive ? "bg-success" : "bg-border"
                        )} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-2">
                      <p className={cn("text-sm", isActive ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                      {step.subtitle && isActive && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.subtitle}</p>
                      )}
                      {isCurrent && trip.status === "in-transit" && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="h-2 w-2 rounded-full bg-info animate-pulse" />
                          <span className="text-xs text-info font-medium">Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Driver</p>
                  <p className="font-medium">{trip.driverName || "Assigned"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Truck</p>
                  <p className="font-medium">{trip.truckNumber || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Container</p>
                  <p className="font-medium font-mono">{trip.containerNumber || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="font-medium">{trip.origin} → {trip.destination}</p>
                </div>
              </div>
            </div>

            {trip.driverPhone && (
              <a
                href={`tel:${trip.driverPhone}`}
                className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
              >
                <Phone className="h-4 w-4" /> Call Driver
              </a>
            )}
          </CardContent>
        </Card>

        {/* Delivery OTP */}
        {trip.deliveryOtp && trip.status === "in-transit" && trip.customerAccepted && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Share this code with the driver upon delivery:</p>
              <p className="text-4xl font-bold tracking-[0.4em] text-warning">{trip.deliveryOtp}</p>
            </CardContent>
          </Card>
        )}

        {/* Completed */}
        {(trip.status === "delivered" || trip.status === "completed") && (
          <Card className="border-success/40 bg-success/5">
            <CardContent className="pt-4 text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-success mx-auto" />
              <p className="font-bold text-success text-lg">Delivery Completed</p>
              {trip.actualEndTime && (
                <p className="text-sm text-muted-foreground">
                  Delivered at {new Date(trip.actualEndTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
              {trip.deliveryConfirmedBy && (
                <p className="text-xs text-muted-foreground">Confirmed by: {trip.deliveryConfirmedBy}</p>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-2 pb-4">
          Powered by Shippers Link Agencies Co., Ltd
        </p>
      </div>
    </div>
  );
}
