import { TaxFiling } from "@/types/finance";
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
import { FileText, AlertTriangle } from "lucide-react";

interface TaxFilingTableProps {
  filings: TaxFiling[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  filed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const taxTypeColors: Record<string, string> = {
  VAT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  PAYE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Corporate: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  Withholding: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Customs Duty": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export function TaxFilingTable({ filings }: TaxFilingTableProps) {
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
          <TableHead>Tax Type</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Filing Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filings.map((filing) => (
          <TableRow key={filing.id}>
            <TableCell>
              <Badge className={taxTypeColors[filing.taxType]}>{filing.taxType}</Badge>
            </TableCell>
            <TableCell className="font-medium">{filing.period}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {filing.status === "overdue" && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={filing.status === "overdue" ? "text-red-600 font-medium" : ""}>
                  {filing.dueDate}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {filing.filingDate || "-"}
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(filing.amount)}</TableCell>
            <TableCell className="font-mono text-xs">
              {filing.referenceNumber || "-"}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[filing.status]}>
                {filing.status.charAt(0).toUpperCase() + filing.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                {filing.status === "pending" ? "File" : "View"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
