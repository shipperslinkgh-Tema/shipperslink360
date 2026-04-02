import { useState } from "react";
import { Calculator, Loader2, Sparkles, Search, Package, Plane, Boxes, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fmt } from "./types";
import { generateGoodsDutyPdf } from "./generateGoodsDutyPdf";
import { COUNTRIES } from "./countries";

interface HsSuggestion {
  hs_code: string;
  description: string;
  duty_rate: number;
  confidence: string;
}

interface GoodsEstimate {
  hs_code: string;
  hs_description: string;
  duty_rate_percent: number;
  cif_value: number;
  import_duty: number;
  vat: number;
  nhil: number;
  getfund: number;
  ecowas_levy: number;
  au_levy: number;
  exim_levy: number;
  processing_fee: number;
  total_duties: number;
  total_landed_cost: number;
  currency: string;
  notes: string;
  recommendations?: string;
  misclassification_warning?: string;
}

interface GhsConversion {
  exchange_rate: number;
  rate_source: string;
  from_currency: string;
  ghs_cif_value: number;
  ghs_total_duties: number;
  ghs_total_landed_cost: number;
  [key: string]: any;
}

const CURRENCIES = ["USD", "EUR", "GBP", "GHS", "CNY"];
const COMMON_ORIGINS = COUNTRIES;

const CARGO_TYPES = [
  { value: "general", label: "General Cargo" },
  { value: "consolidated_lcl", label: "Consolidated (LCL)" },
  { value: "air_freight", label: "Air Freight" },
];

const cargoIcons: Record<string, React.ReactNode> = {
  general: <Package className="h-4 w-4" />,
  consolidated_lcl: <Boxes className="h-4 w-4" />,
  air_freight: <Plane className="h-4 w-4" />,
};

export default function GoodsEstimator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestingHs, setSuggestingHs] = useState(false);
  const [hsSuggestions, setHsSuggestions] = useState<HsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [estimate, setEstimate] = useState<GoodsEstimate | null>(null);
  const [ghsConversion, setGhsConversion] = useState<GhsConversion | null>(null);

  const [hsCode, setHsCode] = useState("");
  const [description, setDescription] = useState("");
  const [fob, setFob] = useState("");
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [origin, setOrigin] = useState("");
  const [cargoType, setCargoType] = useState("general");
  const [exchangeRate, setExchangeRate] = useState("");

  const cifValue = (parseFloat(fob) || 0) + (parseFloat(freight) || 0) + (parseFloat(insurance) || 0);

  const handleSuggestHs = async () => {
    if (!description.trim()) return;
    setSuggestingHs(true);
    setHsSuggestions([]);
    setShowSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-hs-code", {
        body: { goods_description: description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHsSuggestions(data.suggestions || []);
    } catch (err: any) {
      toast({ title: "Suggestion Failed", description: err.message, variant: "destructive" });
      setShowSuggestions(false);
    } finally {
      setSuggestingHs(false);
    }
  };

  const handleEstimate = async () => {
    if (!hsCode.trim() && !description.trim()) {
      toast({ title: "Input required", description: "Enter an HS code or goods description.", variant: "destructive" });
      return;
    }
    if (cifValue <= 0) {
      toast({ title: "Invalid CIF", description: "FOB + Freight + Insurance must be > 0.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setEstimate(null);
    setGhsConversion(null);
    try {
      const { data, error } = await supabase.functions.invoke("duty-estimator", {
        body: {
          hs_code: hsCode,
          goods_description: description,
          fob_value: parseFloat(fob) || 0,
          freight_value: parseFloat(freight) || 0,
          insurance_value: parseFloat(insurance) || 0,
          cif_value: cifValue,
          currency,
          country_of_origin: origin,
          cargo_type: cargoType,
          exchange_rate: exchangeRate ? parseFloat(exchangeRate) : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEstimate(data.estimate);
      setGhsConversion(data.ghs_conversion || null);
      toast({ title: "Estimate Ready" });
    } catch (err: any) {
      toast({ title: "Estimation Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEstimate(null);
    setGhsConversion(null);
    setHsCode("");
    setDescription("");
    setFob("");
    setFreight("");
    setInsurance("");
    setExchangeRate("");
  };

  return (
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
          {/* Cargo Type */}
          <div className="space-y-2">
            <Label>Cargo Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {CARGO_TYPES.map(ct => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCargoType(ct.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    cargoType === ct.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {cargoIcons[ct.value]}
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description + HS Suggest */}
          <div className="space-y-2">
            <Label>Product Description</Label>
            <Textarea
              placeholder="e.g. Laptop computers for commercial use"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSuggestHs}
              disabled={suggestingHs || !description.trim()}
            >
              {suggestingHs ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Finding HS Codes...</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 mr-1.5" />AI Suggest HS Code</>
              )}
            </Button>

            {showSuggestions && hsSuggestions.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="px-3 py-2 bg-muted/50 border-b border-border">
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <Search className="h-3 w-3" />AI Suggested HS Codes
                  </p>
                </div>
                <div className="divide-y divide-border max-h-48 overflow-y-auto">
                  {hsSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setHsCode(s.hs_code); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-primary">{s.hs_code}</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{s.duty_rate}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>HS Code</Label>
            <Input placeholder="e.g. 8471.30.00 (or let AI determine)" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
            <p className="text-[10px] text-muted-foreground">Leave blank for AI auto-classification</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>FOB *</Label>
              <Input type="number" placeholder="0.00" value={fob} onChange={(e) => setFob(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Freight</Label>
              <Input type="number" placeholder="0.00" value={freight} onChange={(e) => setFreight(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Insurance</Label>
              <Input type="number" placeholder="0.00" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">CIF Value</p>
            <p className="text-lg font-bold">{currency} {fmt(cifValue)}</p>
          </div>

          <div className="space-y-2">
            <Label>Country of Origin</Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COMMON_ORIGINS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {currency !== "GHS" && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-dashed border-primary/30">
              <Label className="flex items-center gap-1.5">
                <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                Exchange Rate ({currency} → GHS)
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Leave blank for live rate"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleEstimate} disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Estimating...</>
            ) : (
              <><Calculator className="h-4 w-4 mr-2" />Estimate Duties</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="lg:col-span-3">
        {!estimate && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No Estimate Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in import details and click "Estimate Duties"
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Analyzing & Computing Duties...</h3>
              <p className="text-sm text-muted-foreground mt-1">AI is classifying goods and calculating tariffs</p>
            </CardContent>
          </Card>
        )}

        {estimate && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tariff Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HS Code</span>
                  <span className="font-mono font-semibold text-primary">{estimate.hs_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-semibold text-right max-w-[60%]">{estimate.hs_description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duty Rate</span>
                  <span className="font-semibold">{estimate.duty_rate_percent}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Duty Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[hsl(210,54%,23%)]">
                      <TableHead className="text-primary-foreground">Component</TableHead>
                      <TableHead className="text-primary-foreground text-right">{estimate.currency}</TableHead>
                      {ghsConversion && <TableHead className="text-primary-foreground text-right">GHS</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["CIF Value", estimate.cif_value, ghsConversion?.ghs_cif_value],
                      ["Import Duty", estimate.import_duty, ghsConversion?.ghs_import_duty],
                      ["VAT", estimate.vat, ghsConversion?.ghs_vat],
                      ["NHIL", estimate.nhil, ghsConversion?.ghs_nhil],
                      ["GETFund", estimate.getfund, ghsConversion?.ghs_getfund],
                      ["ECOWAS Levy", estimate.ecowas_levy, ghsConversion?.ghs_ecowas_levy],
                      ["AU Levy", estimate.au_levy, ghsConversion?.ghs_au_levy],
                      ["EXIM Levy", estimate.exim_levy, ghsConversion?.ghs_exim_levy],
                      ["Processing Fee", estimate.processing_fee, ghsConversion?.ghs_processing_fee],
                    ].map(([label, usd, ghs], i) => (
                      <TableRow key={String(label)} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell>{String(label)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(usd as number)}</TableCell>
                        {ghsConversion && <TableCell className="text-right font-mono">{fmt((ghs as number) || 0)}</TableCell>}
                      </TableRow>
                    ))}
                    <TableRow className="bg-[hsl(45,100%,90%)] border-t-2 border-primary">
                      <TableCell className="font-bold text-[hsl(40,80%,24%)]">TOTAL DUTIES</TableCell>
                      <TableCell className="text-right font-bold font-mono text-[hsl(40,80%,24%)]">{fmt(estimate.total_duties)}</TableCell>
                      {ghsConversion && <TableCell className="text-right font-bold font-mono text-[hsl(40,80%,24%)]">{fmt(ghsConversion.ghs_total_duties)}</TableCell>}
                    </TableRow>
                    <TableRow className="bg-[hsl(140,40%,90%)]">
                      <TableCell className="font-bold text-[hsl(145,63%,22%)]">TOTAL LANDED COST</TableCell>
                      <TableCell className="text-right font-bold font-mono text-[hsl(145,63%,22%)]">{fmt(estimate.total_landed_cost)}</TableCell>
                      {ghsConversion && <TableCell className="text-right font-bold font-mono text-[hsl(145,63%,22%)]">{fmt(ghsConversion.ghs_total_landed_cost)}</TableCell>}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {ghsConversion && (
              <div className="bg-[hsl(45,100%,90%)] rounded-lg p-3 text-center">
                <p className="text-xs text-[hsl(40,80%,30%)]">Exchange Rate: 1 {ghsConversion.from_currency} = {fmt(ghsConversion.exchange_rate)} GHS ({ghsConversion.rate_source})</p>
              </div>
            )}

            {estimate.notes && (
              <Card>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground">{estimate.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>New Estimate</Button>
              <Button className="flex-1" onClick={() => generateGoodsDutyPdf(estimate, ghsConversion, currency)}>
                Generate PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
