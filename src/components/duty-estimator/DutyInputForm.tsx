import { useState } from "react";
import { Calculator, Loader2, Sparkles, Search, Package, Car, Plane, Boxes, ArrowLeftRight } from "lucide-react";
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
import { DutyFormData, HsSuggestion, CargoType, CURRENCIES, COMMON_ORIGINS, CARGO_TYPES, fmt } from "./types";

interface DutyInputFormProps {
  form: DutyFormData;
  onUpdate: (field: string, value: string) => void;
  onEstimate: () => void;
  loading: boolean;
}

const cargoIcons: Record<CargoType, React.ReactNode> = {
  general: <Package className="h-4 w-4" />,
  vehicle: <Car className="h-4 w-4" />,
  consolidated_lcl: <Boxes className="h-4 w-4" />,
  air_freight: <Plane className="h-4 w-4" />,
};

export default function DutyInputForm({ form, onUpdate, onEstimate, loading }: DutyInputFormProps) {
  const { toast } = useToast();
  const [hsSuggestions, setHsSuggestions] = useState<HsSuggestion[]>([]);
  const [suggestingHs, setSuggestingHs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cifValue = (parseFloat(form.fob_value) || 0) + (parseFloat(form.freight_value) || 0) + (parseFloat(form.insurance_value) || 0);

  const handleSuggestHsCode = async () => {
    if (!form.goods_description.trim()) {
      toast({ title: "Description required", description: "Enter a goods description first.", variant: "destructive" });
      return;
    }
    setSuggestingHs(true);
    setHsSuggestions([]);
    setShowSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-hs-code", {
        body: { goods_description: form.goods_description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHsSuggestions(data.suggestions || []);
    } catch (err: any) {
      toast({ title: "Suggestion Failed", description: err.message || "Could not suggest HS codes.", variant: "destructive" });
      setShowSuggestions(false);
    } finally {
      setSuggestingHs(false);
    }
  };

  const selectHsCode = (s: HsSuggestion) => {
    onUpdate("hs_code", s.hs_code);
    setShowSuggestions(false);
    toast({ title: "HS Code Selected", description: `${s.hs_code} — ${s.description}` });
  };

  return (
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
          <div className="grid grid-cols-2 gap-2">
            {CARGO_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => onUpdate("cargo_type", ct.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.cargo_type === ct.value
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

        {/* Vehicle Engine Capacity */}
        {form.cargo_type === "vehicle" && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-dashed border-primary/30">
            <Label htmlFor="engine_capacity" className="flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-primary" />
              Engine Capacity (cc)
            </Label>
            <Input
              id="engine_capacity"
              type="number"
              placeholder="e.g. 1600, 2000, 3500"
              value={form.engine_capacity}
              onChange={(e) => onUpdate("engine_capacity", e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">Required for accurate vehicle duty calculation</p>
          </div>
        )}

        {/* Goods Description + HS Suggest */}
        <div className="space-y-2">
          <Label htmlFor="goods">Product Description</Label>
          <Textarea
            id="goods"
            placeholder={form.cargo_type === "vehicle" ? "e.g. Toyota Camry 2020, 2.5L petrol sedan" : "e.g. Laptop computers for commercial use"}
            value={form.goods_description}
            onChange={(e) => onUpdate("goods_description", e.target.value)}
            rows={2}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSuggestHsCode}
            disabled={suggestingHs || !form.goods_description.trim()}
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
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Search className="h-3 w-3" />AI Suggested HS Codes
                </p>
              </div>
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {hsSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectHsCode(s)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{s.hs_code}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5">{s.duty_rate}%</Badge>
                        <Badge variant="outline" className={`text-[10px] h-5 ${
                          s.confidence === "high" ? "border-success/40 text-success"
                            : s.confidence === "medium" ? "border-warning/40 text-warning"
                            : "border-muted-foreground/40 text-muted-foreground"
                        }`}>{s.confidence}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hs_code">HS Code</Label>
          <Input
            id="hs_code"
            placeholder="e.g. 8471.30.00 (or let AI determine)"
            value={form.hs_code}
            onChange={(e) => onUpdate("hs_code", e.target.value)}
          />
          <p className="text-[10px] text-muted-foreground">Leave blank for AI auto-classification</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={form.currency} onValueChange={(v) => onUpdate("currency", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="fob">FOB Value *</Label>
            <Input id="fob" type="number" placeholder="0.00" value={form.fob_value} onChange={(e) => onUpdate("fob_value", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freight">Freight</Label>
            <Input id="freight" type="number" placeholder="0.00" value={form.freight_value} onChange={(e) => onUpdate("freight_value", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance</Label>
            <Input id="insurance" type="number" placeholder="0.00" value={form.insurance_value} onChange={(e) => onUpdate("insurance_value", e.target.value)} />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Calculated CIF Value</p>
          <p className="text-lg font-bold text-foreground">{form.currency} {fmt(cifValue)}</p>
        </div>

        <div className="space-y-2">
          <Label>Country of Origin</Label>
          <Select value={form.country_of_origin} onValueChange={(v) => onUpdate("country_of_origin", v)}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {COMMON_ORIGINS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" size="lg" onClick={onEstimate} disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Estimating Duties...</>
          ) : (
            <><Calculator className="h-4 w-4 mr-2" />Estimate Duties</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
