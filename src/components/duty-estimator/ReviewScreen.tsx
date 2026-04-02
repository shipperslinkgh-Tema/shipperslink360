import { useState } from "react";
import { Car, AlertTriangle, Calculator, ArrowLeft, Edit3, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VinDecodedVehicle, calculateDuty, DutyCalculation, fmt } from "./types";
import { COUNTRIES } from "./countries";

interface Props {
  vehicle: VinDecodedVehicle;
  onBack: () => void;
  onCalculated: (calc: DutyCalculation) => void;
}

export default function ReviewScreen({ vehicle, onBack, onCalculated }: Props) {
  const [cifUsd, setCifUsd] = useState("");
  const [exchangeRate, setExchangeRate] = useState("16.50");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.modelYear;
  const isOld = vehicleAge > 10;

  const handleCalculate = () => {
    const cif = parseFloat(cifUsd);
    const rate = parseFloat(exchangeRate);
    if (!cif || cif <= 0) return;
    if (!rate || rate <= 0) return;
    const calc = calculateDuty(cif, rate, vehicle.modelYear);
    onCalculated(calc);
  };

  const detailRows: [string, string][] = [
    ["Make", vehicle.make],
    ["Model", vehicle.model],
    ["Year", String(vehicle.modelYear)],
    ["Engine", vehicle.displacementL !== "—" ? `${vehicle.displacementL}L` : "—"],
    ["Fuel", vehicle.fuelType],
    ["Transmission", vehicle.transmissionStyle],
    ["Drive Type", vehicle.driveType],
    ["Body", vehicle.bodyClass],
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Vehicle Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Vehicle Details
            </CardTitle>
            {isOld && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Over 10 years — Age penalty applies
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {detailRows.map(([label, value]) => (
              <div key={label} className="space-y-0.5">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">VIN</p>
            <p className="text-sm font-mono tracking-wider text-foreground">{vehicle.vin}</p>
          </div>
        </CardContent>
      </Card>

      {/* CIF & Exchange Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cif">CIF Value (USD) *</Label>
              <Input
                id="cif"
                type="number"
                placeholder="e.g. 8500"
                value={cifUsd}
                onChange={(e) => setCifUsd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Exchange Rate (GHS/USD)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Default: current approximate rate</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Country of Origin
            </Label>
            <Select value={countryOfOrigin} onValueChange={setCountryOfOrigin}>
              <SelectTrigger><SelectValue placeholder="Select country of origin" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {cifUsd && parseFloat(cifUsd) > 0 && exchangeRate && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">GHS Equivalent</p>
              <p className="text-lg font-bold text-foreground">
                GHS {fmt((parseFloat(cifUsd) || 0) * (parseFloat(exchangeRate) || 0))}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleCalculate}
            disabled={!cifUsd || parseFloat(cifUsd) <= 0}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Duty
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
