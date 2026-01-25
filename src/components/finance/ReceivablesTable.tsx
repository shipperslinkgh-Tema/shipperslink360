import { Receivable, CustomerCredit } from "@/types/finance";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceivablesTableProps {
  receivables: Receivable[];
  onContactCustomer?: (customerId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

const statusColors: Record<string, string> = {
  current: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  disputed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  written_off: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const creditStatusColors: Record<string, string> = {
  good: "text-green-600",
  watch: "text-amber-600",
  hold: "text-orange-600",
  suspend: "text-red-600",
};

const agingBucketColors: Record<string, string> = {
  current: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "1-30": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "31-60": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "61-90": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "90+": "bg-red-200 text-red-900 dark:bg-red-950/50 dark:text-red-300",
};

export function ReceivablesTable({
  receivables,
  onContactCustomer,
  onRecordPayment,
}: ReceivablesTableProps) {
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
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Original</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead className="text-right">Outstanding</TableHead>
          <TableHead>Aging</TableHead>
          <TableHead>Credit Status</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receivables.map((receivable) => (
          <TableRow key={receivable.id}>
            <TableCell>
              <div>
                <p className="font-mono text-sm font-medium">
                  {receivable.invoiceNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {receivable.dueDate}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium">{receivable.customer}</span>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(receivable.originalAmount)}
            </TableCell>
            <TableCell className="text-right text-green-600">
              {formatCurrency(receivable.paidAmount)}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  "font-semibold",
                  receivable.outstandingAmount > 0 ? "text-amber-600" : "text-green-600"
                )}
              >
                {formatCurrency(receivable.outstandingAmount)}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge className={agingBucketColors[receivable.agingBucket]}>
                  {receivable.agingBucket === "current"
                    ? "Current"
                    : `${receivable.agingBucket} days`}
                </Badge>
                {receivable.daysOutstanding > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({receivable.daysOutstanding}d)
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {receivable.creditStatus === "good" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {receivable.creditStatus === "watch" && (
                  <Clock className="h-4 w-4 text-amber-600" />
                )}
                {receivable.creditStatus === "hold" && (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                {receivable.creditStatus === "suspend" && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium capitalize",
                    creditStatusColors[receivable.creditStatus]
                  )}
                >
                  {receivable.creditStatus}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={statusColors[receivable.status]}>
                {receivable.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onContactCustomer?.(receivable.customerId)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onContactCustomer?.(receivable.customerId)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </DropdownMenuItem>
                  {receivable.outstandingAmount > 0 && (
                    <DropdownMenuItem
                      onClick={() => onRecordPayment?.(receivable.invoiceId)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Record Payment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
