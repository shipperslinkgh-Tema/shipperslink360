import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, User, Clock, CheckCircle, Navigation, Package, Shield } from "lucide-react";
import { TrackingTrip, GpsLog } from "@/types/tracking";
import { useAcceptDeliveryMonitoring, useLatestGps } from "@/hooks/useTracking";
import { SimulatedMap } from "./SimulatedMap";

interface Props {
  trip: TrackingTrip;
}

export function CustomerTrackingPage({ trip }: Props) {
  const acceptMonitoring = useAcceptDeliveryMonitoring();
  const { data: latestGps } = useLatestGps(trip.trackingActive ? trip.id : undefined);

  const statusSteps = [
    { key: "scheduled", label: "Trip Scheduled", icon: Clock },
    { key: "arrived_at_pickup", label: "At Pickup", icon: MapPin },
    { key: "in-transit", label: "In Transit", icon: Navigation },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIdx = statusSteps.findIndex((s) => s.key === trip.status);

  // Calculate ETA countdown
  let etaText = "Calculating...";
  if (trip.estimatedDeliveryTime) {
    const diff = new Date(trip.estimatedDeliveryTime).getTime() - Date.now();
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      etaText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} minutes`;
    } else {
      etaText = "Arriving soon";
    }
  } else if (trip.status === "delivered" || trip.status === "completed") {
    etaText = "Delivered";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-medium opacity-80">SLAC Live Tracking</span>
          </div>
          <h1 className="text-xl font-bold">Shippers Link Agencies</h1>
          <p className="text-sm opacity-80 mt-1">Delivery Tracking</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Accept Monitoring Banner */}
        {!trip.customerAccepted && trip.trackingActive && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 text-center space-y-3">
              <Shield className="h-8 w-8 text-primary mx-auto" />
              <p className="text-sm">
                Accept delivery monitoring to track your cargo in real-time.
              </p>
              <Button
                className="w-full"
                onClick={() => acceptMonitoring.mutate(trip.id)}
                disabled={acceptMonitoring.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                ACCEPT DELIVERY MONITORING
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trip Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusSteps.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCurrent ? "bg-primary text-primary-foreground" :
                      isActive ? "bg-green-500 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Simulated Map */}
        {(trip.customerAccepted || !trip.trackingActive) && trip.status !== "scheduled" && (
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <SimulatedMap
                latestGps={latestGps || undefined}
                tripStatus={trip.status}
                origin={trip.pickupLocation || trip.origin}
                destination={trip.deliveryLocation || trip.destination}
              />
            </CardContent>
          </Card>
        )}

        {/* ETA & Details */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">ETA</span>
              </div>
              <span className="text-lg font-bold text-primary">{etaText}</span>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-medium">{trip.driverName || "Assigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Truck:</span>
                <span className="font-medium">{trip.truckNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Container:</span>
                <span className="font-medium">{trip.containerNumber || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery OTP for customer */}
        {trip.deliveryOtp && trip.status === "in-transit" && trip.customerAccepted && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Share this code with the driver upon delivery:
              </p>
              <p className="text-3xl font-bold tracking-widest text-amber-700">
                {trip.deliveryOtp}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completed */}
        {(trip.status === "delivered" || trip.status === "completed") && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="pt-4 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="font-medium text-green-700">Delivery Completed</p>
              {trip.actualEndTime && (
                <p className="text-sm text-muted-foreground">
                  Delivered at {new Date(trip.actualEndTime).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Powered by Shippers Link Agencies Co., Ltd
        </p>
      </div>
    </div>
  );
}
