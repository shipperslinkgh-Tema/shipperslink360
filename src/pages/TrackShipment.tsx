import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, AlertCircle } from "lucide-react";
import { CustomerTrackingPage } from "@/components/tracking/CustomerTrackingPage";
import { TrackingTrip, mapTripFromDb, GpsLog } from "@/types/tracking";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function usePublicTrip(token: string | undefined) {
  return useQuery({
    queryKey: ["public-trip", token],
    queryFn: async (): Promise<{ trip: TrackingTrip; latestGps: GpsLog | null }> => {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/track-shipment?token=${token}`,
        { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (!res.ok) throw new Error("Trip not found");
      const data = await res.json();
      return {
        trip: mapTripFromDb(data.trip),
        latestGps: data.latestGps ? {
          id: "",
          tripId: data.trip.id,
          latitude: Number(data.latestGps.latitude),
          longitude: Number(data.latestGps.longitude),
          speed: Number(data.latestGps.speed) || 0,
          heading: Number(data.latestGps.heading) || 0,
          accuracy: 0,
          recordedAt: data.latestGps.recorded_at,
        } : null,
      };
    },
    enabled: !!token,
    refetchInterval: 10000,
  });
}

export default function TrackShipment() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = usePublicTrip(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center space-y-3">
          <Truck className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-lg font-bold">Tracking Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This tracking link may have expired or is invalid. Please contact Shippers Link Agencies for assistance.
          </p>
        </div>
      </div>
    );
  }

  return <CustomerTrackingPage trip={data.trip} />;
}
