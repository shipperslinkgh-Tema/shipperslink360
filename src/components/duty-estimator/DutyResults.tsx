import { FileText, DollarSign, Globe, Info, TrendingUp, Printer, AlertTriangle, Lightbulb, ShieldAlert, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DutyEstimate, GhsConversion, DutyFormData, fmt } from "./types";

interface DutyResultsProps {
  estimate: DutyEstimate;
  ghsConversion: GhsConversion | null;
  form: DutyFormData;
  onReset: () => void;
}

export default function DutyResults({ estimate, ghsConversion, form, onReset }: DutyResultsProps) {
  const handleExportPdf = () => {
    window.print();
  };

  const breakdownItems = [
    { label: "CIF Value", value: estimate.cif_value, ghsValue: ghsConversion?.ghs_cif_value, bold: true, isBase: true },
    { label: `Import Duty (${estimate.duty_rate_percent}%)`, value: estimate.import_duty, ghsValue: ghsConversion?.ghs_import_duty },
    { label: "VAT (15%)", value: estimate.vat, ghsValue: ghsConversion?.ghs_vat },
    { label: "NHIL (2.5%)", value: estimate.nhil, ghsValue: ghsConversion?.ghs_nhil },
    { label: "GETFund Levy (2.5%)", value: estimate.getfund, ghsValue: ghsConversion?.ghs_getfund },
    { label: "ECOWAS Levy (0.5%)", value: estimate.ecowas_levy || 0, ghsValue: ghsConversion?.ghs_ecowas_levy },
    { label: "AU Levy (0.2%)", value: estimate.au_levy || 0, ghsValue: ghsConversion?.ghs_au_levy },
    { label: "EXIM Levy (0.75%)", value: estimate.exim_levy, ghsValue: ghsConversion?.ghs_exim_levy },
    { label: "Processing Fee (1%)", value: estimate.processing_fee, ghsValue: ghsConversion?.ghs_processing_fee },
  ];

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Summary Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimated Duties</p>
              <p className="text-3xl font-bold text-primary">
                GHS {fmt(ghsConversion?.ghs_total_duties ?? estimate.total_duties)}
              </p>
              {ghsConversion && estimate.currency !== "GHS" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {estimate.currency} {fmt(estimate.total_duties)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Landed Cost</p>
              <p className="text-xl font-semibold text-foreground">
                GHS {fmt(ghsConversion?.ghs_total_landed_cost ?? estimate.total_landed_cost)}
              </p>
              {ghsConversion && estimate.currency !== "GHS" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {estimate.currency} {fmt(estimate.total_landed_cost)}
                </p>
              )}
            </div>
          </div>
          {ghsConversion && estimate.currency !== "GHS" && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Exchange Rate: 1 {ghsConversion.from_currency} = GHS {fmt(ghsConversion.exchange_rate)}
                <Badge variant="outline" className={`text-[9px] h-4 ml-1 ${
                  ghsConversion.rate_source === "manual" ? "border-primary/40 text-primary" 
                    : ghsConversion.rate_source === "live" ? "border-success/40 text-success" 
                    : "border-warning/40 text-warning"
                }`}>
                  {ghsConversion.rate_source === "manual" ? "Manual Rate" : ghsConversion.rate_source === "live" ? "Live Rate" : "Indicative Rate"}
                </Badge>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HS Code Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent-foreground" />
            Tariff Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">HS Code</p>
              <p className="font-mono font-bold text-foreground text-lg">{estimate.hs_code}</p>
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
                  <Globe className="h-3 w-3 mr-1" />ECOWAS Preferential Rate May Apply
                </Badge>
              </div>
            )}
          </div>
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

      {/* Duty Breakdown Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            Step-by-Step Duty & Tax Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {breakdownItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-2 px-3 rounded-md ${
                  item.bold ? "bg-muted/50 font-semibold" : ""
                }`}
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="text-right">
                  <span className="text-sm font-mono text-foreground">
                    GHS {fmt(item.ghsValue ?? item.value)}
                  </span>
                  {ghsConversion && estimate.currency !== "GHS" && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {estimate.currency} {fmt(item.value)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded-md">
              <span className="text-sm font-bold text-primary">Total Duties Payable</span>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-primary">
                  GHS {fmt(ghsConversion?.ghs_total_duties ?? estimate.total_duties)}
                </span>
                {ghsConversion && estimate.currency !== "GHS" && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {estimate.currency} {fmt(estimate.total_duties)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />Total Landed Cost
              </span>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-foreground">
                  GHS {fmt(ghsConversion?.ghs_total_landed_cost ?? estimate.total_landed_cost)}
                </span>
                {ghsConversion && estimate.currency !== "GHS" && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {estimate.currency} {fmt(estimate.total_landed_cost)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {estimate.recommendations && (
        <Card className="bg-success/5 border-success/30">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <Lightbulb className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-success uppercase mb-1">Cost-Saving Recommendations</p>
                <p className="text-sm text-foreground">{estimate.recommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Notes */}
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

      {/* Disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> This is an estimate. Final duty may vary based on customs assessment,
              current GRA rates, exemptions, trade agreements, exchange rates, and ICUMS verification.
              Always verify with Ghana Revenue Authority before making financial commitments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap print:hidden">
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <Printer className="h-4 w-4 mr-1" />Print / Export PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          New Estimate
        </Button>
      </div>
    </div>
  );
}
