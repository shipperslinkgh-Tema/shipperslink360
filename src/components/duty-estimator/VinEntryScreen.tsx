import { useState } from "react";
import { Car, Search, Loader2, AlertTriangle, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VinDecodedVehicle, validateVin } from "./types";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onDecoded: (vehicle: VinDecodedVehicle) => void;
  onManualEntry: () => void;
}

function extractField(results: any[], variableId: number): string {
  const item = results.find((r: any) => r.VariableId === variableId);
  return item?.Value?.trim() || "—";
}

export default function VinEntryScreen({ onDecoded, onManualEntry }: Props) {
  const { toast } = useToast();
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVinChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[IOQ]/g, "").replace(/[^A-HJ-NPR-Z0-9]/g, "");
    setVin(cleaned.slice(0, 17));
    setError("");
  };

  const handleDecode = async () => {
    if (!validateVin(vin)) {
      setError("VIN must be exactly 17 characters (no I, O, or Q).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
      if (!resp.ok) throw new Error("NHTSA API unavailable");
      const json = await resp.json();
      const results = json.Results || [];

      const make = extractField(results, 26);
      const model = extractField(results, 28);
      const yearStr = extractField(results, 29);
      const modelYear = parseInt(yearStr) || 0;

      if (!modelYear || make === "—") {
        setError("VIN not found in NHTSA database. Use manual entry instead.");
        return;
      }

      const vehicle: VinDecodedVehicle = {
        vin,
        make,
        model,
        modelYear,
        displacementL: extractField(results, 13),
        fuelType: extractField(results, 24),
        transmissionStyle: extractField(results, 37),
        driveType: extractField(results, 15),
        bodyClass: extractField(results, 5),
        vehicleType: extractField(results, 39),
      };

      onDecoded(vehicle);
      toast({ title: "VIN Decoded", description: `${vehicle.make} ${vehicle.model} ${vehicle.modelYear}` });
    } catch (err: any) {
      setError(err.message || "Failed to decode VIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          SLAC VIN Duty Estimator
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter a 17-character Vehicle Identification Number to decode &amp; estimate Ghana customs duty
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            VIN Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vin">Vehicle Identification Number</Label>
            <Input
              id="vin"
              value={vin}
              onChange={(e) => handleVinChange(e.target.value)}
              placeholder="e.g. 1HGBH41JXMN109186"
              className="font-mono text-lg tracking-widest text-center"
              maxLength={17}
              onKeyDown={(e) => e.key === "Enter" && handleDecode()}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {vin.length}/17 characters — Letters I, O, Q are excluded
              </p>
              {vin.length === 17 && (
                <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                  Ready
                </Badge>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleDecode} disabled={loading || vin.length !== 17}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Decoding VIN...</>
            ) : (
              <><Search className="h-4 w-4 mr-2" />Decode VIN</>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={onManualEntry}>
            <Keyboard className="h-4 w-4 mr-2" />
            Enter Vehicle Details Manually
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
