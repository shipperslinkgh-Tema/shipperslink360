import { GpsLog } from "@/types/tracking";
import { MapPin, Navigation } from "lucide-react";

interface Props {
  latestGps?: GpsLog;
  tripStatus: string;
  origin: string;
  destination: string;
}

export function SimulatedMap({ latestGps, tripStatus, origin, destination }: Props) {
  // Simulated map with visual indicators — will be replaced with Google Maps later
  const isMoving = tripStatus === "in-transit";
  
  return (
    <div className="relative h-64 bg-gradient-to-br from-emerald-100 via-blue-50 to-emerald-50 flex items-center justify-center overflow-hidden">
      {/* Simulated road paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="none">
        <path
          d="M 40 200 Q 120 180 200 130 Q 280 80 360 60"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeDasharray="8 4"
          fill="none"
        />
        {isMoving && (
          <circle r="6" fill="hsl(var(--primary))">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 40 200 Q 120 180 200 130 Q 280 80 360 60" />
          </circle>
        )}
      </svg>

      {/* Origin marker */}
      <div className="absolute bottom-8 left-8 flex items-center gap-1.5">
        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shadow">
          <MapPin className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-medium bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
          {origin || "Pickup"}
        </span>
      </div>

      {/* Destination marker */}
      <div className="absolute top-4 right-8 flex items-center gap-1.5">
        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shadow">
          <Navigation className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-medium bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
          {destination || "Delivery"}
        </span>
      </div>

      {/* GPS Info */}
      {latestGps && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {latestGps.latitude.toFixed(4)}, {latestGps.longitude.toFixed(4)}
          {latestGps.speed > 0 && ` • ${latestGps.speed.toFixed(0)} km/h`}
        </div>
      )}

      {/* Map placeholder text */}
      <div className="text-center z-10">
        <p className="text-sm text-muted-foreground font-medium">
          {isMoving ? "🚛 Truck en route..." : tripStatus === "delivered" ? "✅ Delivered" : "Map View"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Google Maps integration coming soon
        </p>
      </div>
    </div>
  );
}
