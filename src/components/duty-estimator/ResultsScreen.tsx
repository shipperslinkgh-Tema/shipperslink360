import { ArrowLeft, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VinDecodedVehicle, DutyCalculation, fmt } from "./types";
import { generateVinDutyPdf } from "./generateDutyPdf";

interface Props {
  vehicle: VinDecodedVehicle;
  calc: DutyCalculation;
  onBack: () => void;
  onReset: () => void;
}

export default function ResultsScreen({ vehicle, calc, onBack, onReset }: Props) {
  const rows = [
    { n: 1, label: "Import Duty", basis: "20% on CIF Value", amount: calc.import_duty },
    { n: 2, label: "Value Added Tax (VAT)", basis: "15% VAT-inclusive formula", amount: calc.vat },
    { n: 3, label: "NHIL + GETFund Levy", basis: "2.5% + 2.5% on CIF", amount: calc.nhil_getfund },
    { n: 4, label: "Other Statutory Charges", basis: "ECOWAS, EXIM, SRIC etc.", amount: calc.statutory_charges },
    { n: 5, label: "Age/Depreciation Penalty", basis: calc.is_over_10_years ? `Vehicle ${calc.vehicle_age} yrs old` : "N/A", amount: calc.age_penalty },
  ];

  const handlePdf = () => {
    generateVinDutyPdf(vehicle, calc);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          New Estimate
        </Button>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <p className="text-sm text-muted-foreground">
          {vehicle.modelYear} {vehicle.make} {vehicle.model}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{vehicle.vin}</p>
      </div>

      {/* Valuation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Valuation Basis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CIF Value (USD)</span>
            <span className="font-semibold">$ {fmt(calc.cif_usd)}</span>
          </div>
          <div className="flex justify-between bg-[hsl(45,100%,90%)] rounded px-2 py-1">
            <span className="font-medium text-[hsl(40,80%,30%)]">Exchange Rate</span>
            <span className="font-bold text-[hsl(40,80%,30%)]">1 USD = {fmt(calc.exchange_rate)} GHS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GHS Equivalent</span>
            <span className="font-semibold">GHS {fmt(calc.cif_ghs)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Duty Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Estimated Duty Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(210,54%,23%)]">
                <TableHead className="text-primary-foreground w-8">#</TableHead>
                <TableHead className="text-primary-foreground">Charge Component</TableHead>
                <TableHead className="text-primary-foreground">Basis / Notes</TableHead>
                <TableHead className="text-primary-foreground text-right">Amount (GHS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.n} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{row.n}</TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{row.basis}</TableCell>
                  <TableCell className="text-right font-mono">{fmt(row.amount)}</TableCell>
                </TableRow>
              ))}
              {/* Total */}
              <TableRow className="bg-[hsl(45,100%,90%)] border-t-2 border-primary">
                <TableCell />
                <TableCell colSpan={2} className="font-bold text-[hsl(40,80%,24%)]">
                  TOTAL ESTIMATED DUTY
                </TableCell>
                <TableCell className="text-right font-bold font-mono text-[hsl(40,80%,24%)]">
                  GHS {fmt(calc.total_duty)}
                </TableCell>
              </TableRow>
              {/* Negotiable Range */}
              <TableRow className="bg-[hsl(140,40%,90%)]">
                <TableCell />
                <TableCell colSpan={2} className="font-bold text-[hsl(145,63%,22%)]">
                  ESTIMATED NEGOTIABLE RANGE
                </TableCell>
                <TableCell className="text-right font-bold font-mono text-[hsl(145,63%,22%)]">
                  GHS {fmt(calc.negotiable_min)} – {fmt(calc.negotiable_max)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handlePdf}>
        <FileDown className="h-4 w-4 mr-2" />
        Generate PDF Report
      </Button>
    </div>
  );
}
