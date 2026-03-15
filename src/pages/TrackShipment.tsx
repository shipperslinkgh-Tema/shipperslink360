import { useParams } from "react-router-dom";
import { useTripByToken } from "@/hooks/useTracking";
import { CustomerTrackingPage } from "@/components/tracking/CustomerTrackingPage";
import { Truck, AlertCircle } from "lucide-react";

export default function TrackShipment() {
  const { token } = useParams<{ token: string }>();
  const { data: trip, isLoading, error } = useTripByToken(token);

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

  if (error || !trip) {
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

  return <CustomerTrackingPage trip={trip} />;
}
