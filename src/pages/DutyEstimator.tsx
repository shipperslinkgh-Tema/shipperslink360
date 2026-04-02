import { useState } from "react";
import { Calculator, AlertTriangle, Car, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VinEntryScreen from "@/components/duty-estimator/VinEntryScreen";
import ReviewScreen from "@/components/duty-estimator/ReviewScreen";
import ResultsScreen from "@/components/duty-estimator/ResultsScreen";
import ManualEntryScreen from "@/components/duty-estimator/ManualEntryScreen";
import GoodsEstimator from "@/components/duty-estimator/GoodsEstimator";
import { VinDecodedVehicle, DutyCalculation } from "@/components/duty-estimator/types";

type VehicleScreen = "vin" | "manual" | "review" | "results";

export default function DutyEstimator() {
  const [vehicleScreen, setVehicleScreen] = useState<VehicleScreen>("vin");
  const [vehicle, setVehicle] = useState<VinDecodedVehicle | null>(null);
  const [calc, setCalc] = useState<DutyCalculation | null>(null);

  const handleDecoded = (v: VinDecodedVehicle) => {
    setVehicle(v);
    setVehicleScreen("review");
  };

  const handleCalculated = (c: DutyCalculation) => {
    setCalc(c);
    setVehicleScreen("results");
  };

  const handleVehicleReset = () => {
    setVehicle(null);
    setCalc(null);
    setVehicleScreen("vin");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            SLAC AI DUTY ESTIMATOR
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-driven Ghana import duty calculator — vehicles &amp; general goods
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-warning border-warning/40">
          <AlertTriangle className="h-3 w-3" />
          Estimates only — verify with GRA
        </Badge>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="goods" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            General Goods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-6">
          {vehicleScreen === "vin" && (
            <VinEntryScreen onDecoded={handleDecoded} onManualEntry={() => setVehicleScreen("manual")} />
          )}
          {vehicleScreen === "manual" && (
            <ManualEntryScreen onSubmit={handleDecoded} onBack={() => setVehicleScreen("vin")} />
          )}
          {vehicleScreen === "review" && vehicle && (
            <ReviewScreen vehicle={vehicle} onBack={() => setVehicleScreen("vin")} onCalculated={handleCalculated} />
          )}
          {vehicleScreen === "results" && vehicle && calc && (
            <ResultsScreen vehicle={vehicle} calc={calc} onBack={() => setVehicleScreen("review")} onReset={handleVehicleReset} />
          )}
        </TabsContent>

        <TabsContent value="goods" className="mt-6">
          <GoodsEstimator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
