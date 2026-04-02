import { useState } from "react";
import { Car, Search, Loader2, AlertTriangle, Keyboard, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Common makes for quick selection
const POPULAR_MAKES = [
  "Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Mercedes-Benz", "BMW",
  "Volkswagen", "Ford", "Chevrolet", "Mitsubishi", "Mazda", "Suzuki",
  "Lexus", "Audi", "Peugeot", "Renault", "Isuzu", "Land Rover",
  "Jeep", "Subaru", "Volvo", "DAF", "MAN", "Scania", "Iveco",
  "Hino", "Fuso", "Sinotruk", "Shacman", "Dongfeng",
];

export default function VinEntryScreen({ onDecoded, onManualEntry }: Props) {
  const { toast } = useToast();
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search by details state
  const [searchMake, setSearchMake] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchModels, setSearchModels] = useState<{ Model_Name: string }[]>([]);
  const [searchModel, setSearchModel] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => String(currentYear - i));

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
        setError("VIN not found in NHTSA database. Use manual entry or search by vehicle details.");
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

  const handleFetchModels = async () => {
    if (!searchMake || !searchYear) return;
    setSearchLoading(true);
    setSearchModels([]);
    setSearchModel("");
    try {
      const resp = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(searchMake)}/modelyear/${searchYear}?format=json`
      );
      if (!resp.ok) throw new Error("Failed to fetch models");
      const json = await resp.json();
      const models = (json.Results || []).filter((m: any) => m.Model_Name);
      if (models.length === 0) {
        toast({ title: "No models found", description: "Try a different make or year, or use manual entry.", variant: "destructive" });
      }
      setSearchModels(models);
    } catch (err: any) {
      toast({ title: "Search Failed", description: err.message, variant: "destructive" });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchMake || !searchModel || !searchYear) return;
    onDecoded({
      vin: "SEARCH-ENTRY",
      make: searchMake,
      model: searchModel,
      modelYear: parseInt(searchYear),
      displacementL: "—",
      fuelType: "—",
      transmissionStyle: "—",
      driveType: "—",
      bodyClass: "—",
      vehicleType: "—",
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          SLAC Vehicle Duty Estimator
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter a VIN or search by vehicle make, model &amp; year
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="vin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="vin" className="text-xs gap-1">
                <Search className="h-3.5 w-3.5" /> VIN Lookup
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs gap-1">
                <List className="h-3.5 w-3.5" /> Search Vehicle
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs gap-1">
                <Keyboard className="h-3.5 w-3.5" /> Manual Entry
              </TabsTrigger>
            </TabsList>

            {/* VIN Tab */}
            <TabsContent value="vin" className="space-y-4">
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
                    <Badge variant="outline" className="text-xs border-primary/40 text-primary">Ready</Badge>
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
            </TabsContent>

            {/* Search by Details Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Make *</Label>
                  <Select value={searchMake} onValueChange={(v) => { setSearchMake(v); setSearchModels([]); setSearchModel(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select make" /></SelectTrigger>
                    <SelectContent>
                      {POPULAR_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Year *</Label>
                  <Select value={searchYear} onValueChange={(v) => { setSearchYear(v); setSearchModels([]); setSearchModel(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleFetchModels}
                disabled={!searchMake || !searchYear || searchLoading}
              >
                {searchLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching Models...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" />Find Models</>
                )}
              </Button>

              {searchModels.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Model *</Label>
                  <Select value={searchModel} onValueChange={setSearchModel}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {searchModels.map((m, i) => (
                        <SelectItem key={`${m.Model_Name}-${i}`} value={m.Model_Name}>{m.Model_Name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {searchModel && (
                <div className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                  <p className="text-sm font-semibold">{searchYear} {searchMake} {searchModel}</p>
                  <p className="text-xs text-muted-foreground">Vehicle details confirmed</p>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSearchSubmit}
                disabled={!searchMake || !searchModel || !searchYear}
              >
                <Car className="h-4 w-4 mr-2" />
                Continue to Valuation
              </Button>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual">
              <Button variant="outline" className="w-full" size="lg" onClick={onManualEntry}>
                <Keyboard className="h-4 w-4 mr-2" />
                Open Manual Entry Form
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Enter all vehicle details manually when VIN or search doesn't work
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
