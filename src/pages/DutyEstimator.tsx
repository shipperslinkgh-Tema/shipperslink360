import { useState } from "react";
import { Calculator, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VinEntryScreen from "@/components/duty-estimator/VinEntryScreen";
import ReviewScreen from "@/components/duty-estimator/ReviewScreen";
import ResultsScreen from "@/components/duty-estimator/ResultsScreen";
import ManualEntryScreen from "@/components/duty-estimator/ManualEntryScreen";
import { VinDecodedVehicle, DutyCalculation } from "@/components/duty-estimator/types";

type Screen = "vin" | "manual" | "review" | "results";

export default function DutyEstimator() {
  const [screen, setScreen] = useState<Screen>("vin");
  const [vehicle, setVehicle] = useState<VinDecodedVehicle | null>(null);
  const [calc, setCalc] = useState<DutyCalculation | null>(null);

  const handleDecoded = (v: VinDecodedVehicle) => {
    setVehicle(v);
    setScreen("review");
  };

  const handleCalculated = (c: DutyCalculation) => {
    setCalc(c);
    setScreen("results");
  };

  const handleReset = () => {
    setVehicle(null);
    setCalc(null);
    setScreen("vin");
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
            VIN-verified Ghana customs duty calculator with PDF export
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-warning border-warning/40">
          <AlertTriangle className="h-3 w-3" />
          Estimates only — verify with GRA
        </Badge>
      </div>

      {screen === "vin" && (
        <VinEntryScreen onDecoded={handleDecoded} onManualEntry={() => setScreen("manual")} />
      )}
      {screen === "manual" && (
        <ManualEntryScreen onSubmit={handleDecoded} onBack={() => setScreen("vin")} />
      )}
      {screen === "review" && vehicle && (
        <ReviewScreen vehicle={vehicle} onBack={() => setScreen("vin")} onCalculated={handleCalculated} />
      )}
      {screen === "results" && vehicle && calc && (
        <ResultsScreen vehicle={vehicle} calc={calc} onBack={() => setScreen("review")} onReset={handleReset} />
      )}
    </div>
  );
}
