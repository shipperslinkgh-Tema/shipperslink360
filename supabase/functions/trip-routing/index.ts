// OSM-based geocoding + routing (Nominatim + OSRM). No API key required.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA = "ShippersLink360/1.0 (ops@shipperslink.gh)";

async function geocode(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!r.ok) throw new Error(`Geocode failed (${r.status})`);
  const j = await r.json();
  if (!Array.isArray(j) || j.length === 0) throw new Error(`No match for "${q}"`);
  return { lat: Number(j[0].lat), lng: Number(j[0].lon), display_name: j[0].display_name as string };
}

async function route(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`Routing failed (${r.status})`);
  const j = await r.json();
  if (!j.routes?.[0]) throw new Error("No route found");
  const route = j.routes[0];
  // GeoJSON LineString coordinates are [lng, lat]; convert to [lat, lng] pairs for Leaflet usage.
  const coords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
  return {
    distance_km: route.distance / 1000,
    eta_seconds: Math.round(route.duration),
    polyline: coords,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pickup, delivery, pickup_coords, delivery_coords } = await req.json();
    const from = pickup_coords ?? (pickup ? await geocode(pickup) : null);
    const to = delivery_coords ?? (delivery ? await geocode(delivery) : null);
    if (!from || !to) throw new Error("pickup and delivery are required");
    const r = await route(from, to);
    return new Response(
      JSON.stringify({ pickup: from, delivery: to, ...r }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("trip-routing error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
