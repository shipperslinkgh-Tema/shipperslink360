import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { useEndTrip } from "@/hooks/useTracking";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tripId: string | null;
}

export function ConfirmDeliveryDialog({ open, onOpenChange, tripId }: Props) {
  const endTrip = useEndTrip();
  const [otp, setOtp] = useState("");
  const [podFile, setPodFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [delivery, setDelivery] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open || !tripId) return;
    setOtp(""); setPodFile(null); setPreview(null); setCoords(null); setError(null);
    supabase.from("trucking_trips").select("delivery_lat, delivery_lng").eq("id", tripId).single()
      .then(({ data }) => setDelivery({ lat: (data as any)?.delivery_lat ?? null, lng: (data as any)?.delivery_lng ?? null }));
    captureGps();
  }, [open, tripId]);

  const captureGps = () => {
    if (!("geolocation" in navigator)) { setError("Geolocation not available"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy || 0 }); setLocating(false); },
      (e) => { setError("GPS error: " + e.message); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onFile = (f: File | null) => {
    setPodFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const distance = (() => {
    if (!coords || delivery.lat == null || delivery.lng == null) return null;
    const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(delivery.lat - coords.lat);
    const dLng = toRad(delivery.lng - coords.lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(coords.lat))*Math.cos(toRad(delivery.lat))*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  })();

  const submit = () => {
    setError(null);
    if (!tripId) return;
    if (!podFile) { setError("POD photo or signature is required"); return; }
    if (!coords) { setError("Waiting for GPS — tap 'Capture GPS'"); return; }
    endTrip.mutate(
      { tripId, otp: otp || undefined, confirmedBy: "staff", podFile, podLat: coords.lat, podLng: coords.lng },
      { onSuccess: () => onOpenChange(false), onError: (e: any) => setError(e?.message || "Failed to confirm delivery") }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Confirm Delivery (Geo-verified POD)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">POD photo or signature <span className="text-destructive">*</span></label>
          <input
            type="file" accept="image/*" capture="environment"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
          />
          {preview && <img src={preview} alt="POD" className="w-full max-h-40 object-contain rounded border" />}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Delivery GPS <span className="text-destructive">*</span></label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={captureGps} disabled={locating}>
              <MapPin className="h-4 w-4 mr-1" />
              {locating ? "Locating…" : coords ? "Recapture" : "Capture GPS"}
            </Button>
            {coords && (
              <span className="text-xs text-muted-foreground font-mono">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (±{Math.round(coords.acc)}m)
              </span>
            )}
          </div>
          {distance != null && (
            <p className={cn("text-xs font-medium", distance <= 950 ? "text-success" : "text-destructive")}>
              {distance <= 950 ? "✓" : "✗"} {Math.round(distance)} m from delivery point (limit 950 m)
            </p>
          )}
          {(delivery.lat == null || delivery.lng == null) && (
            <p className="text-xs text-warning">⚠ Delivery point has no GPS on file — delivery cannot be geo-verified. Edit the trip to set coordinates.</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Customer OTP (optional)</label>
          <Input
            placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)}
            maxLength={6} className="text-center text-lg tracking-[0.3em] font-mono" inputMode="numeric"
          />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={endTrip.isPending || !podFile || !coords}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {endTrip.isPending ? "Submitting…" : "Confirm Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
