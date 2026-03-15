import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrackingTrip, GpsLog, mapTripFromDb, mapGpsFromDb } from "@/types/tracking";

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 12; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Queries ──────────────────────────────────────────────────

export function useTrackingTrips(statusFilter?: string) {
  return useQuery({
    queryKey: ["tracking-trips", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("trucking_trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapTripFromDb);
    },
  });
}

export function useTrackingTrip(id: string | undefined) {
  return useQuery({
    queryKey: ["tracking-trip", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("trucking_trips")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return mapTripFromDb(data);
    },
    enabled: !!id,
  });
}

export function useTripByToken(token: string | undefined) {
  return useQuery({
    queryKey: ["tracking-trip-token", token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from("trucking_trips")
        .select("*")
        .eq("tracking_token", token)
        .single();
      if (error) throw error;
      return mapTripFromDb(data);
    },
    enabled: !!token,
  });
}

export function useGpsLogs(tripId: string | undefined) {
  return useQuery({
    queryKey: ["gps-logs", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const { data, error } = await supabase
        .from("trip_gps_logs")
        .select("*")
        .eq("trip_id", tripId)
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapGpsFromDb);
    },
    enabled: !!tripId,
    refetchInterval: 10000, // Refresh every 10s for live tracking
  });
}

export function useLatestGps(tripId: string | undefined) {
  return useQuery({
    queryKey: ["latest-gps", tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const { data, error } = await supabase
        .from("trip_gps_logs")
        .select("*")
        .eq("trip_id", tripId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapGpsFromDb(data) : null;
    },
    enabled: !!tripId,
    refetchInterval: 5000,
  });
}

// ── Mutations ──────────────────────────────────────────────────

export function useActivateTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const token = generateToken();
      const trackingUrl = `${window.location.origin}/track/${token}`;
      const otp = generateOtp();

      const { error } = await supabase
        .from("trucking_trips")
        .update({
          tracking_token: token,
          tracking_url: trackingUrl,
          tracking_active: true,
          delivery_otp: otp,
        } as any)
        .eq("id", tripId);
      if (error) throw error;
      return { token, trackingUrl, otp };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracking-trips"] });
      qc.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Tracking activated — link generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTripStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, status, extraData }: {
      tripId: string;
      status: string;
      extraData?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from("trucking_trips")
        .update({ status, ...extraData } as any)
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracking-trips"] });
      qc.invalidateQueries({ queryKey: ["tracking-trip"] });
      qc.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Trip status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRecordGps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      tripId: string;
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    }) => {
      const { error } = await supabase.from("trip_gps_logs").insert({
        trip_id: log.tripId,
        latitude: log.latitude,
        longitude: log.longitude,
        speed: log.speed || 0,
        heading: log.heading || 0,
        accuracy: log.accuracy || 0,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gps-logs"] });
      qc.invalidateQueries({ queryKey: ["latest-gps"] });
    },
  });
}

export function useAcceptDeliveryMonitoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from("trucking_trips")
        .update({
          customer_accepted: true,
          customer_accepted_at: new Date().toISOString(),
        } as any)
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracking-trip-token"] });
      toast.success("Delivery monitoring accepted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEndTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, otp, confirmedBy }: {
      tripId: string;
      otp?: string;
      confirmedBy?: string;
    }) => {
      // Verify OTP if provided
      if (otp) {
        const { data: trip } = await supabase
          .from("trucking_trips")
          .select("delivery_otp")
          .eq("id", tripId)
          .single();
        if (trip && (trip as any).delivery_otp !== otp) {
          throw new Error("Invalid OTP code");
        }
      }

      const { error } = await supabase
        .from("trucking_trips")
        .update({
          status: "delivered",
          actual_end_time: new Date().toISOString(),
          tracking_active: false,
          delivery_confirmed_by: confirmedBy || "driver",
          delivery_date: new Date().toISOString().split("T")[0],
        } as any)
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracking-trips"] });
      qc.invalidateQueries({ queryKey: ["tracking-trip"] });
      qc.invalidateQueries({ queryKey: ["trucking-trips"] });
      toast.success("Trip completed — delivery confirmed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
