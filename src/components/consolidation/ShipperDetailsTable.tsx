import { Package, FileCheck, DollarSign, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Shipper } from "@/types/consolidation";

interface ShipperDetailsTableProps {
  shippers: Shipper[];
}

const getCargoStatusIcon = (status: Shipper["cargoStatus"]) => {
  switch (status) {
    case "dispatched":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "loaded":
      return <Package className="h-4 w-4 text-info" />;
    case "stored":
      return <Package className="h-4 w-4 text-accent" />;
    case "tallied":
      return <FileCheck className="h-4 w-4 text-warning" />;
    case "received":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getCustomsStatusBadge = (status: Shipper["customsStatus"]) => {
  const styles: Record<Shipper["customsStatus"], string> = {
    pending: "bg-muted text-muted-foreground",
    submitted: "bg-info/10 text-info border-info/20",
    assessment: "bg-warning/10 text-warning border-warning/20",
    payment: "bg-accent/10 text-accent border-accent/20",
    examination: "bg-warning/10 text-warning border-warning/20",
    released: "bg-success/10 text-success border-success/20",
    held: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const labels: Record<Shipper["customsStatus"], string> = {
    pending: "Pending",
    submitted: "Submitted",
    assessment: "Assessment",
    payment: "Payment",
    examination: "Examination",
    released: "Released",
    held: "Held",
  };

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", styles[status])}>
      {labels[status]}
    </Badge>
  );
};

const getCustomsProgress = (status: Shipper["customsStatus"]) => {
  const progressMap: Record<Shipper["customsStatus"], number> = {
    pending: 0,
    submitted: 20,
    assessment: 40,
    payment: 60,
    examination: 80,
    released: 100,
    held: 50,
  };
  return progressMap[status];
};

export function ShipperDetailsTable({ shippers }: ShipperDetailsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          Shipper Cargo Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {shippers.length} shippers in this consolidation
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>HBL/HAWB</TableHead>
            <TableHead>Shipper / Consignee</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Packages</TableHead>
            <TableHead className="text-right">CBM / Weight</TableHead>
            <TableHead>Cargo Status</TableHead>
            <TableHead>Customs</TableHead>
            <TableHead className="text-right">Charges</TableHead>
            <TableHead className="text-center">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shippers.map((shipper) => (
            <TableRow key={shipper.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {shipper.houseBLNumber || shipper.houseAWBNumber}
                  </span>
                  {shipper.icumsRef && (
                    <span className="text-xs text-muted-foreground">
                      ICUMS: {shipper.icumsRef}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{shipper.shipperName}</p>
                  <p className="text-xs text-muted-foreground">→ {shipper.consigneeName}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  <p className="text-sm truncate">{shipper.description}</p>
                  <p className="text-xs text-muted-foreground font-mono">{shipper.hsCode}</p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {shipper.packages} {shipper.packageType}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{shipper.cbm} m³</p>
                  <p className="text-xs text-muted-foreground">
                    {shipper.grossWeight.toLocaleString()} kg
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getCargoStatusIcon(shipper.cargoStatus)}
                  <span className="text-sm capitalize">{shipper.cargoStatus}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2 min-w-[120px]">
                  {getCustomsStatusBadge(shipper.customsStatus)}
                  <Progress 
                    value={getCustomsProgress(shipper.customsStatus)} 
                    className="h-1.5"
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{formatCurrency(shipper.totalCharge)}</p>
                  {shipper.dutyAmount && (
                    <p className="text-xs text-muted-foreground">
                      Duty: {formatCurrency(shipper.dutyAmount)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {shipper.paid ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Paid
                  </Badge>
                ) : shipper.invoiced ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Invoiced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Pending
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
