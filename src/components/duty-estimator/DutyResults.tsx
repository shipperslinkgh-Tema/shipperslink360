import { FileText, DollarSign, Globe, Info, TrendingUp, Printer, AlertTriangle, Lightbulb, ShieldAlert, Download, ExternalLink, Hash, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DutyEstimate, GhsConversion, DutyFormData, fmt } from "./types";
import { generateDutyPdf } from "./generateDutyPdf";

interface DutyResultsProps {
  estimate: DutyEstimate;
  ghsConversion: GhsConversion | null;
  form: DutyFormData;
  onReset: () => void;
}

export default function DutyResults({ estimate, ghsConversion, form, onReset }: DutyResultsProps) {
  const handleExportPdf = () => {
    generateDutyPdf(estimate, ghsConversion, form);
  };

  const exchangeRate = ghsConversion?.exchange_rate ?? 1;
  const toGhs = (usd: number) => ghsConversion ? usd * exchangeRate : usd;
  const curr = estimate.currency || form.currency;
  const isGhs = curr === "GHS";

  const breakdownItems = [
    { label: `Import Duty (HS ${estimate.hs_code})`, rate: `${estimate.duty_rate_percent}%`, base: `CIF ${curr} ${fmt(estimate.cif_value)}`, usd: estimate.import_duty, ghs: ghsConversion?.ghs_import_duty ?? toGhs(estimate.import_duty) },
    { label: "ECOWAS Community Levy", rate: "0.5%", base: `CIF ${curr} ${fmt(estimate.cif_value)}`, usd: estimate.ecowas_levy || 0, ghs: ghsConversion?.ghs_ecowas_levy ?? toGhs(estimate.ecowas_levy || 0) },
    { label: "EXIM / African Union Levy", rate: "0.75%", base: `CIF ${curr} ${fmt(estimate.cif_value)}`, usd: estimate.exim_levy + (estimate.au_levy || 0), ghs: (ghsConversion?.ghs_exim_levy ?? toGhs(estimate.exim_levy)) + (ghsConversion?.ghs_au_levy ?? toGhs(estimate.au_levy || 0)) },
    { label: "Examination / Processing Fee", rate: "1%", base: `CIF ${curr} ${fmt(estimate.cif_value)}`, usd: estimate.processing_fee, ghs: ghsConversion?.ghs_processing_fee ?? toGhs(estimate.processing_fee) },
  ];

  const vatBase = estimate.cif_value + estimate.import_duty + (estimate.ecowas_levy || 0) + (estimate.au_levy || 0) + estimate.exim_levy + estimate.processing_fee;
  const ghsVatBase = toGhs(vatBase);

  const taxItems = [
    { label: "VAT", rate: "15%", base: `VAT Base ${curr} ${fmt(vatBase)}`, usd: estimate.vat, ghs: ghsConversion?.ghs_vat ?? toGhs(estimate.vat) },
    { label: "NHIL (National Health Insurance Levy)", rate: "2.5%", base: `VAT Base ${curr} ${fmt(vatBase)}`, usd: estimate.nhil, ghs: ghsConversion?.ghs_nhil ?? toGhs(estimate.nhil) },
    { label: "GETFund Levy", rate: "2.5%", base: `VAT Base ${curr} ${fmt(vatBase)}`, usd: estimate.getfund, ghs: ghsConversion?.ghs_getfund ?? toGhs(estimate.getfund) },
  ];

  const allItems = [...breakdownItems, { label: "VAT Base", rate: "", base: "CIF + All Levies", usd: vatBase, ghs: ghsVatBase, isSummary: true }, ...taxItems];

  const totalDutiesGhs = ghsConversion?.ghs_total_duties ?? toGhs(estimate.total_duties);
  const totalLandedGhs = ghsConversion?.ghs_total_landed_cost ?? toGhs(estimate.total_landed_cost);

  const refNo = `SLAC/DA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

  return (
    <div className="space-y-5 print:space-y-3">
      {/* Header Info */}
      <Card className="border-primary/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">ESTIMATED CUSTOMS DUTY ASSESSMENT</h2>
              <p className="text-xs text-muted-foreground italic">Pre-Arrival Duty Estimate — For Client Reference Only</p>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex gap-2"><span className="text-muted-foreground font-medium">Prepared by:</span><span className="text-foreground">Shippers Link Agencies Co., Ltd</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground font-medium">Port of Entry:</span><span className="text-foreground">Tema, Ghana</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Tariff Classification */}
      <Card>
        <CardHeader className="pb-2 bg-[hsl(var(--primary))] rounded-t-lg">
          <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
            <Hash className="h-4 w-4" />
            1. TARIFF CLASSIFICATION & DUTY RATE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">HS Code</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Description</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Import Duty Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-primary text-lg">{estimate.hs_code}</td>
                  <td className="py-3 px-3 text-foreground">{estimate.hs_description}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant={estimate.duty_rate_percent === 0 ? "default" : "secondary"} className="text-sm">
                      {estimate.duty_rate_percent}%{estimate.duty_rate_percent === 0 ? " — ZERO RATED" : ""}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {estimate.ecowas_applicable && (
            <p className="text-xs text-muted-foreground mt-2 px-3">
              <Globe className="h-3 w-3 inline mr-1" />
              ECOWAS preferential rate may apply for goods originating from member states.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Misclassification Warning */}
      {estimate.misclassification_warning && (
        <Card className="bg-destructive/5 border-destructive/30">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive uppercase mb-1">Classification Alert</p>
                <p className="text-sm text-foreground">{estimate.misclassification_warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Valuation Basis */}
      <Card>
        <CardHeader className="pb-2 bg-[hsl(var(--primary))] rounded-t-lg">
          <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            2. VALUATION BASIS (GRA CIF Methodology)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Parameter</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Amount ({curr})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="py-2.5 px-3 text-foreground">FOB Value</td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">{curr} {fmt(parseFloat(form.fob_value) || 0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-foreground">Freight</td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">{curr} {fmt(parseFloat(form.freight_value) || 0)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-foreground">Insurance</td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">{curr} {fmt(parseFloat(form.insurance_value) || 0)}</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="py-2.5 px-3 font-bold text-primary">CIF Value (Customs Base)</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{curr} {fmt(estimate.cif_value)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Duty & Levy Breakdown */}
      <Card>
        <CardHeader className="pb-2 bg-[hsl(var(--primary))] rounded-t-lg">
          <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            3. ESTIMATED DUTY & LEVY BREAKDOWN (2026 GRA / ICUMS Rates)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Charge</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">Rate</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Base</th>
                  {!isGhs && <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">{curr}</th>}
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">GHS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allItems.map((item, i) => (
                  <tr key={i} className={item.isSummary ? "bg-muted/50 font-semibold" : ""}>
                    <td className={`py-2.5 px-3 ${item.isSummary ? "font-bold text-foreground" : "text-foreground"}`}>{item.label}</td>
                    <td className={`py-2.5 px-3 text-center ${item.isSummary ? "text-foreground" : item.usd === 0 ? "text-success font-semibold" : "text-muted-foreground"}`}>{item.rate || "—"}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{item.base}</td>
                    {!isGhs && (
                      <td className={`py-2.5 px-3 text-right font-mono ${item.isSummary ? "font-bold text-foreground" : item.usd === 0 ? "text-success" : "text-foreground"}`}>
                        {curr} {fmt(item.usd)}
                      </td>
                    )}
                    <td className={`py-2.5 px-3 text-right font-mono ${item.isSummary ? "font-bold text-primary" : item.ghs === 0 ? "text-success" : "text-foreground"}`}>
                      GHS {fmt(item.ghs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="mt-4 border-2 border-primary rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
              <span className="font-bold text-foreground text-sm">ESTIMATED TOTAL CUSTOMS DUTY PAYABLE</span>
              <div className="text-right">
                {!isGhs && (
                  <p className="text-sm font-bold font-mono text-foreground">≈ {curr} {fmt(estimate.total_duties)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-primary/20">
              {ghsConversion && !isGhs && (
                <p className="text-xs text-muted-foreground">
                  Exchange Rate: GHS {fmt(exchangeRate)} / {ghsConversion.from_currency}
                  <Badge variant="outline" className={`ml-2 text-[9px] h-4 ${ghsConversion.rate_source === "live" ? "border-success/40 text-success" : ghsConversion.rate_source === "manual" ? "border-primary/40 text-primary" : "border-warning/40 text-warning"}`}>
                    {ghsConversion.rate_source === "manual" ? "Manual Rate" : ghsConversion.rate_source === "live" ? "Live Rate" : "Indicative"}
                  </Badge>
                </p>
              )}
              {isGhs && <span />}
              <p className="text-xl font-bold font-mono text-primary">≈ GHS {fmt(totalDutiesGhs)}</p>
            </div>
          </div>

          {/* Total Landed Cost */}
          <div className="mt-3 flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Truck className="h-4 w-4" />Total Landed Cost (CIF + All Duties)
            </span>
            <div className="text-right">
              <p className="text-lg font-bold font-mono text-foreground">GHS {fmt(totalLandedGhs)}</p>
              {!isGhs && <p className="text-[10px] text-muted-foreground font-mono">{curr} {fmt(estimate.total_landed_cost)}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Key Flags & Notes */}
      {(estimate.recommendations || estimate.notes) && (
        <Card>
          <CardHeader className="pb-2 bg-[hsl(var(--primary))] rounded-t-lg">
            <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              4. KEY FLAGS & NOTES
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {estimate.recommendations && (
                <div className="flex gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="w-1.5 bg-success rounded-full shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-success uppercase mb-1">Cost-Saving Recommendations</p>
                    <p className="text-sm text-foreground">{estimate.recommendations}</p>
                  </div>
                </div>
              )}
              {estimate.notes && (
                <div className="flex gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="w-1.5 bg-warning rounded-full shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-warning uppercase mb-1">AI Notes & Caveats</p>
                    <p className="text-sm text-foreground">{estimate.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 5: Verification Tools */}
      <Card>
        <CardHeader className="pb-2 bg-[hsl(var(--primary))] rounded-t-lg">
          <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            5. RECOMMENDED VERIFICATION TOOLS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/50">
                {[
                  { name: "ICUMS Official Calculator", url: "https://external.unipassghana.com", desc: "Official GRA vehicle duty estimate — enter VIN to get CCVR" },
                  { name: "AutoDutyChecker", url: "https://autodutychecker.com", desc: "GRA-aligned duty estimates with full levy breakdown" },
                  { name: "Kitannex.com", url: "https://kitannex.com", desc: "ICUMS-flow calculator with live exchange rates" },
                  { name: "GRA Vehicle Importation", url: "https://gra.gov.gh/customs/vehicle-importation", desc: "Official GRA guidance on vehicle import procedures" },
                ].map((tool, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-semibold text-primary whitespace-nowrap">{tool.name}</td>
                    <td className="py-2.5 px-3">
                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/70 hover:underline">{tool.url}</a>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{tool.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              <strong>DISCLAIMER:</strong> This document is a pre-arrival duty estimate prepared for client planning purposes only. All figures are based on publicly available GRA/ICUMS rates and indicative valuations. The final assessed duty is determined solely by the Ghana Revenue Authority (GRA) Customs Division through the ICUMS/Publican AI System. Shippers Link Agencies Co., Ltd assumes no liability for discrepancies between this estimate and the official GRA assessment. Always verify with GRA before making financial commitments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap print:hidden">
        <Button variant="default" size="sm" onClick={handleExportPdf}>
          <Download className="h-4 w-4 mr-1" />Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />Print
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          New Estimate
        </Button>
      </div>
    </div>
  );
}
