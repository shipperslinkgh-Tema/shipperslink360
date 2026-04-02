import { useState } from "react";
import { ArrowLeft, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VinDecodedVehicle } from "./types";

interface Props {
  onSubmit: (vehicle: VinDecodedVehicle) => void;
  onBack: () => void;
}

export default function ManualEntryScreen({ onSubmit, onBack }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [fuel, setFuel] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (!make || !model || !year) return;
    onSubmit({
      vin: "MANUAL-ENTRY",
      make,
      model,
      modelYear: parseInt(year) || 2020,
      displacementL: engine || "—",
      fuelType: fuel || "—",
      transmissionStyle: "—",
      driveType: "—",
      bodyClass: body || "—",
      vehicleType: "Passenger Car",
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to VIN Lookup
      </Button>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            Manual Vehicle Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Make *</Label>
              <Input placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Model *</Label>
              <Input placeholder="e.g. Camry" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Model Year *</Label>
              <Input type="number" placeholder="e.g. 2018" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Engine (L)</Label>
              <Input placeholder="e.g. 2.5" value={engine} onChange={(e) => setEngine(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <Input placeholder="e.g. Gasoline" value={fuel} onChange={(e) => setFuel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Body Type</Label>
              <Input placeholder="e.g. Sedan" value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!make || !model || !year}>
            Continue to Valuation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
