import { DirectorTaxReminder } from "@/types/finance";
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
import { FileText, AlertTriangle, User } from "lucide-react";

interface DirectorTaxTableProps {
  reminders: DirectorTaxReminder[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  filed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const taxTypeColors: Record<string, string> = {
  "Income Tax": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Capital Gains": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Dividend Tax": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Personal Relief": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};

export function DirectorTaxTable({ reminders }: DirectorTaxTableProps) {
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
          <TableHead>Director</TableHead>
          <TableHead>Tax Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Filing Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reminders.map((reminder) => (
          <TableRow key={reminder.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{reminder.directorName}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={taxTypeColors[reminder.taxType]}>{reminder.taxType}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {reminder.description}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {reminder.status === "overdue" && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={reminder.status === "overdue" ? "text-red-600 font-medium" : ""}>
                  {reminder.dueDate}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {reminder.filingDate || "-"}
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(reminder.amount)}</TableCell>
            <TableCell className="font-mono text-xs">
              {reminder.referenceNumber || "-"}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[reminder.status]}>
                {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                {reminder.status === "pending" || reminder.status === "overdue" ? "File" : "View"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
