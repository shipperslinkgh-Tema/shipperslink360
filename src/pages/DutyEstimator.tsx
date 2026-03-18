import { useState } from "react";
import { Calculator, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DutyInputForm from "@/components/duty-estimator/DutyInputForm";
import DutyResults from "@/components/duty-estimator/DutyResults";
import { DutyEstimate, GhsConversion, DutyFormData } from "@/components/duty-estimator/types";

const INITIAL_FORM: DutyFormData = {
  hs_code: "",
  goods_description: "",
  fob_value: "",
  freight_value: "",
  insurance_value: "",
  currency: "USD",
  country_of_origin: "",
  cargo_type: "general",
  engine_capacity: "",
};

export default function DutyEstimator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<DutyEstimate | null>(null);
  const [ghsConversion, setGhsConversion] = useState<GhsConversion | null>(null);
  const [form, setForm] = useState<DutyFormData>({ ...INITIAL_FORM });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const cifValue = (parseFloat(form.fob_value) || 0) + (parseFloat(form.freight_value) || 0) + (parseFloat(form.insurance_value) || 0);

  const handleEstimate = async () => {
    if (!form.hs_code.trim() && !form.goods_description.trim()) {
      toast({ title: "Input required", description: "Enter an HS code or goods description.", variant: "destructive" });
      return;
    }
    if (cifValue <= 0) {
      toast({ title: "Invalid CIF value", description: "FOB + Freight + Insurance must be greater than zero.", variant: "destructive" });
      return;
    }
    if (form.cargo_type === "vehicle" && !form.engine_capacity) {
      toast({ title: "Engine capacity required", description: "Enter the vehicle engine capacity in cc.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setEstimate(null);
    setGhsConversion(null);

    try {
      const { data, error } = await supabase.functions.invoke("duty-estimator", {
        body: {
          hs_code: form.hs_code,
          goods_description: form.goods_description,
          fob_value: parseFloat(form.fob_value) || 0,
          freight_value: parseFloat(form.freight_value) || 0,
          insurance_value: parseFloat(form.insurance_value) || 0,
          cif_value: cifValue,
          currency: form.currency,
          country_of_origin: form.country_of_origin,
          cargo_type: form.cargo_type,
          engine_capacity: form.engine_capacity,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEstimate(data.estimate);
      setGhsConversion(data.ghs_conversion || null);
      toast({ title: "Estimate Ready", description: "Duty estimation completed successfully." });
    } catch (err: any) {
      console.error("Duty estimation error:", err);
      toast({ title: "Estimation Failed", description: err.message || "Could not estimate duties.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEstimate(null);
    setGhsConversion(null);
    setForm({ ...INITIAL_FORM });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            SLAC AI DUTY ESTIMATOR
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-driven Ghana import duty calculator — supports all cargo types with real-time exchange rates
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-warning border-warning/40">
          <AlertTriangle className="h-3 w-3" />
          Estimates only — verify with GRA
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <DutyInputForm form={form} onUpdate={update} onEstimate={handleEstimate} loading={loading} />

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {!estimate && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Estimate Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the import details and click "Estimate Duties" to get a transparent AI-powered breakdown.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Analyzing & Computing Duties...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is classifying goods and calculating Ghana GRA tariff rates
                </p>
              </CardContent>
            </Card>
          )}

          {estimate && (
            <DutyResults estimate={estimate} ghsConversion={ghsConversion} form={form} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
}
