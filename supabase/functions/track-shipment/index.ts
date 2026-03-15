import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lookup trip by tracking token
    const { data: trip, error } = await supabase
      .from("trucking_trips")
      .select("id, customer, container_number, bl_number, origin, destination, status, tracking_active, customer_accepted, customer_accepted_at, customer_phone, customer_email, pickup_location, delivery_location, driver_name, driver_phone, truck_number, cargo_description, estimated_delivery_time, actual_start_time, actual_end_time, arrived_at_pickup_time, distance_km, delivery_otp, delivery_confirmed_by, tracking_token, tracking_url, trip_cost, driver_payment, fuel_cost, pickup_date, delivery_date")
      .eq("tracking_token", token)
      .single();

    if (error || !trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle accept monitoring action
    if (action === "accept" && req.method === "POST") {
      await supabase
        .from("trucking_trips")
        .update({
          customer_accepted: true,
          customer_accepted_at: new Date().toISOString(),
        })
        .eq("id", trip.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get latest GPS for active trips
    let latestGps = null;
    if (trip.tracking_active) {
      const { data: gps } = await supabase
        .from("trip_gps_logs")
        .select("latitude, longitude, speed, heading, recorded_at")
        .eq("trip_id", trip.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      latestGps = gps;
    }

    return new Response(JSON.stringify({ trip, latestGps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
