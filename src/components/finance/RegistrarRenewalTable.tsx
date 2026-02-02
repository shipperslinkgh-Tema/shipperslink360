import { RegistrarRenewal } from "@/types/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, AlertTriangle, RefreshCw, Building2 } from "lucide-react";

interface RegistrarRenewalTableProps {
  renewals: RegistrarRenewal[];
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expiring_soon: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  renewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  renewed: "Renewed",
};

const registrationTypeColors: Record<string, string> = {
  "Annual Returns": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Business Registration": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Tax Clearance": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "SSNIT Certificate": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Fire Certificate": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "EPA Permit": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "Operating License": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function RegistrarRenewalTable({ renewals }: RegistrarRenewalTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Registration Type</TableHead>
          <TableHead>Registrar</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Renewal Date</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Certificate No.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renewals.map((renewal) => (
          <TableRow key={renewal.id}>
            <TableCell>
              <Badge className={registrationTypeColors[renewal.registrationType]}>
                {renewal.registrationType}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{renewal.registrarName}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {renewal.description}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {(renewal.status === "expired" || renewal.status === "expiring_soon") && (
                  <AlertTriangle className={`h-4 w-4 ${renewal.status === "expired" ? "text-red-500" : "text-amber-500"}`} />
                )}
                <span className={
                  renewal.status === "expired" ? "text-red-600 font-medium" : 
                  renewal.status === "expiring_soon" ? "text-amber-600 font-medium" : ""
                }>
                  {renewal.expiryDate}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {renewal.renewalDate || "-"}
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(renewal.renewalFee)}</TableCell>
            <TableCell className="font-mono text-xs">
              {renewal.certificateNumber || "-"}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[renewal.status]}>
                {statusLabels[renewal.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                {renewal.status === "expired" || renewal.status === "expiring_soon" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Renew
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </>
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
