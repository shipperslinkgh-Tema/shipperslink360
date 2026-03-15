import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GpsLog } from "@/types/tracking";

// Fix default marker icons in bundled environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const truckIcon = new L.DivIcon({
  html: `<div style="background: hsl(var(--primary)); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 3px solid white; font-size: 16px;">🚛</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pickupIcon = new L.DivIcon({
  html: `<div style="background: #22c55e; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; color: white; font-size: 14px;">📦</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="background: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; color: white; font-size: 14px;">📍</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Ghana location defaults
const GHANA_CENTER: [number, number] = [5.6037, -0.1870]; // Accra
const TEMA_PORT: [number, number] = [5.6289, -0.0063];

interface LiveTrackingMapProps {
  gpsLogs?: GpsLog[];
  latestGps?: GpsLog | null;
  tripStatus: string;
  origin: string;
  destination: string;
  className?: string;
  showRoute?: boolean;
  /** For fleet overview with multiple trucks */
  fleetPositions?: Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    status: string;
  }>;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13);
    }
  }, [positions, map]);
  return null;
}

export function LiveTrackingMap({
  gpsLogs = [],
  latestGps,
  tripStatus,
  origin,
  destination,
  className = "h-72",
  showRoute = true,
  fleetPositions,
}: LiveTrackingMapProps) {
  const routePoints: [number, number][] = gpsLogs.map(g => [g.latitude, g.longitude]);
  
  const truckPos: [number, number] | null = latestGps 
    ? [latestGps.latitude, latestGps.longitude]
    : routePoints.length > 0 
    ? routePoints[routePoints.length - 1]
    : null;

  // Determine map center and bounds
  const allPoints: [number, number][] = [];
  if (fleetPositions) {
    fleetPositions.forEach(f => allPoints.push([f.lat, f.lng]));
  }
  if (truckPos) allPoints.push(truckPos);
  if (routePoints.length > 0) allPoints.push(...routePoints);

  const center = allPoints.length > 0 ? allPoints[0] : GHANA_CENTER;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full rounded-lg"
        style={{ minHeight: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {allPoints.length > 0 && <FitBounds positions={allPoints.length >= 2 ? allPoints : [center]} />}

        {/* Fleet mode: multiple trucks */}
        {fleetPositions?.map(fp => (
          <Marker key={fp.id} position={[fp.lat, fp.lng]} icon={truckIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{fp.label}</p>
                <p className="text-muted-foreground capitalize">{fp.status.replace(/_|-/g, " ")}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Single trip mode */}
        {!fleetPositions && (
          <>
            {/* Route trail */}
            {showRoute && routePoints.length >= 2 && (
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: "hsl(var(--primary))",
                  weight: 4,
                  opacity: 0.8,
                  dashArray: tripStatus === "in-transit" ? undefined : "8 6",
                }}
              />
            )}

            {/* Truck marker */}
            {truckPos && tripStatus !== "delivered" && tripStatus !== "completed" && (
              <Marker position={truckPos} icon={truckIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">🚛 Current Position</p>
                    {latestGps && (
                      <>
                        <p>{latestGps.latitude.toFixed(5)}, {latestGps.longitude.toFixed(5)}</p>
                        {latestGps.speed > 0 && <p>Speed: {latestGps.speed.toFixed(0)} km/h</p>}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Origin marker */}
            {routePoints.length > 0 && (
              <Marker position={routePoints[0]} icon={pickupIcon}>
                <Popup><strong>Pickup:</strong> {origin}</Popup>
              </Marker>
            )}

            {/* Destination marker — show at delivered position or estimate */}
            {(tripStatus === "delivered" || tripStatus === "completed") && truckPos && (
              <Marker position={truckPos} icon={deliveryIcon}>
                <Popup><strong>Delivered:</strong> {destination}</Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
