import { useState } from "react";
import { Calculator, FileText, DollarSign, Globe, Package, AlertTriangle, CheckCircle2, Loader2, Info, TrendingUp, Printer, Sparkles, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HsSuggestion {
  hs_code: string;
  description: string;
  duty_rate: number;
  confidence: string;
}

interface DutyEstimate {
  hs_code: string;
  hs_description: string;
  duty_rate_percent: number;
  cif_value: number;
  import_duty: number;
  vat: number;
  nhil: number;
  getfund: number;
  exim_levy: number;
  processing_fee: number;
  total_duties: number;
  total_landed_cost: number;
  currency: string;
  notes: string;
  ecowas_applicable?: boolean;
}

const currencies = ["USD", "EUR", "GBP", "GHS", "CNY"];

const commonOrigins = [
  "China", "United States", "United Kingdom", "Germany", "India",
  "Turkey", "Japan", "South Korea", "Nigeria", "Côte d'Ivoire",
  "Togo", "Burkina Faso", "South Africa", "Netherlands", "Italy",
  "France", "Brazil", "UAE", "Thailand", "Malaysia",
];

export default function DutyEstimator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<DutyEstimate | null>(null);
  const [hsSuggestions, setHsSuggestions] = useState<HsSuggestion[]>([]);
  const [suggestingHs, setSuggestingHs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    hs_code: "",
    goods_description: "",
    fob_value: "",
    freight_value: "",
    insurance_value: "",
    currency: "USD",
    country_of_origin: "",
  });

  const cifValue = (parseFloat(form.fob_value) || 0) + (parseFloat(form.freight_value) || 0) + (parseFloat(form.insurance_value) || 0);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleEstimate = async () => {
    if (!form.hs_code.trim()) {
      toast({ title: "HS Code required", description: "Enter an HS code to estimate duties.", variant: "destructive" });
      return;
    }
    if (cifValue <= 0) {
      toast({ title: "Invalid CIF value", description: "FOB + Freight + Insurance must be greater than zero.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setEstimate(null);

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
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEstimate(data.estimate);
      toast({ title: "Estimate Ready", description: "Duty estimation completed successfully." });
    } catch (err: any) {
      console.error("Duty estimation error:", err);
      toast({ title: "Estimation Failed", description: err.message || "Could not estimate duties.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

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
            Estimate Ghana import duties before ICUMS declaration — powered by AI
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-warning border-warning/40">
          <AlertTriangle className="h-3 w-3" />
          Estimates only — verify with GRA
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Import Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hs_code">HS Code *</Label>
              <Input
                id="hs_code"
                placeholder="e.g. 8471.30.00"
                value={form.hs_code}
                onChange={(e) => update("hs_code", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goods">Goods Description</Label>
              <Textarea
                id="goods"
                placeholder="e.g. Laptop computers for commercial use"
                value={form.goods_description}
                onChange={(e) => update("goods_description", e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fob">FOB Value *</Label>
                <Input
                  id="fob"
                  type="number"
                  placeholder="0.00"
                  value={form.fob_value}
                  onChange={(e) => update("fob_value", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freight">Freight</Label>
                <Input
                  id="freight"
                  type="number"
                  placeholder="0.00"
                  value={form.freight_value}
                  onChange={(e) => update("freight_value", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance</Label>
                <Input
                  id="insurance"
                  type="number"
                  placeholder="0.00"
                  value={form.insurance_value}
                  onChange={(e) => update("insurance_value", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Calculated CIF Value</p>
              <p className="text-lg font-bold text-foreground">
                {form.currency} {fmt(cifValue)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Country of Origin</Label>
              <Select value={form.country_of_origin} onValueChange={(v) => update("country_of_origin", v)}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {commonOrigins.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleEstimate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Estimating Duties...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Estimate Duties
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!estimate && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Estimate Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the import details and click "Estimate Duties" to get an AI-powered breakdown.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Analyzing HS Code & Computing Duties...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is looking up Ghana GRA tariff rates for HS {form.hs_code}
                </p>
              </CardContent>
            </Card>
          )}

          {estimate && (
            <>
              {/* Summary Card */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimated Duties</p>
                      <p className="text-3xl font-bold text-primary">
                        {estimate.currency} {fmt(estimate.total_duties)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Landed Cost</p>
                      <p className="text-xl font-semibold text-foreground">
                        {estimate.currency} {fmt(estimate.total_landed_cost)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HS Code Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    Tariff Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">HS Code</p>
                      <p className="font-mono font-bold text-foreground">{estimate.hs_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Import Duty Rate</p>
                      <Badge variant="secondary" className="text-sm">{estimate.duty_rate_percent}%</Badge>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Tariff Description</p>
                      <p className="text-sm text-foreground">{estimate.hs_description}</p>
                    </div>
                    {estimate.ecowas_applicable && (
                      <div className="sm:col-span-2">
                        <Badge variant="outline" className="text-success border-success/40">
                          <Globe className="h-3 w-3 mr-1" />
                          ECOWAS Preferential Rate May Apply
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Duty Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    Duty & Tax Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { label: "CIF Value", value: estimate.cif_value, bold: true },
                      { label: `Import Duty (${estimate.duty_rate_percent}%)`, value: estimate.import_duty },
                      { label: "VAT (15%)", value: estimate.vat },
                      { label: "NHIL (2.5%)", value: estimate.nhil },
                      { label: "GETFund Levy (2.5%)", value: estimate.getfund },
                      { label: "EXIM Levy (0.75%)", value: estimate.exim_levy },
                      { label: "Processing Fee (1%)", value: estimate.processing_fee },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between py-2 px-3 rounded-md ${
                          item.bold ? "bg-muted/50 font-semibold" : ""
                        }`}
                      >
                        <span className="text-sm text-foreground">{item.label}</span>
                        <span className="text-sm font-mono text-foreground">
                          {estimate.currency} {fmt(item.value)}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded-md">
                      <span className="text-sm font-bold text-primary">Total Duties Payable</span>
                      <span className="text-sm font-bold font-mono text-primary">
                        {estimate.currency} {fmt(estimate.total_duties)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Total Landed Cost
                      </span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {estimate.currency} {fmt(estimate.total_landed_cost)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {estimate.notes && (
                <Card className="bg-warning/5 border-warning/30">
                  <CardContent className="py-4">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-warning uppercase mb-1">AI Notes & Caveats</p>
                        <p className="text-sm text-foreground">{estimate.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print Estimate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEstimate(null);
                    setForm({ hs_code: "", goods_description: "", fob_value: "", freight_value: "", insurance_value: "", currency: "USD", country_of_origin: "" });
                  }}
                >
                  New Estimate
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> This is an AI-powered estimate based on Ghana GRA tariff structures.
              Actual duties may vary based on current GRA rates, exemptions, trade agreements, exchange rates, and ICUMS assessments.
              Always verify with Ghana Revenue Authority before making financial commitments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
