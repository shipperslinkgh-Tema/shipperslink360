import { Payable } from "@/types/finance";
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
  CreditCard,
  CheckCircle,
  XCircle,
  Ship,
  Anchor,
  Truck,
  Building2,
  FileText,
  Clock,
  History as HistoryIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PayablesTableProps {
  payables: Payable[];
  onApprove?: (id: string) => void;
  onPay?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  disputed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const vendorCategoryIcons: Record<string, React.ElementType> = {
  shipping_line: Ship,
  customs: FileText,
  gpha: Anchor,
  trucking: Truck,
  warehouse: Building2,
  agent: Building2,
  office: Building2,
  other: Building2,
};

const vendorCategoryLabels: Record<string, string> = {
  shipping_line: "Shipping Line",
  customs: "Customs",
  gpha: "GPHA",
  trucking: "Trucking",
  warehouse: "Warehouse",
  agent: "Agent",
  office: "Office",
  other: "Other",
};

export function PayablesTable({ payables, onApprove, onPay }: PayablesTableProps) {
  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Job Reference</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payables.map((payable) => {
          const VendorIcon = vendorCategoryIcons[payable.vendorCategory] || Building2;
          const isOverdue =
            payable.status !== "paid" &&
            new Date(payable.dueDate) < new Date();

          return (
            <TableRow key={payable.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <VendorIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{payable.vendor}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {payable.payableRef}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {vendorCategoryLabels[payable.vendorCategory]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {payable.jobRef && (
                    <p className="font-mono text-xs">{payable.jobRef}</p>
                  )}
                  {payable.shipmentRef && (
                    <p className="text-xs text-muted-foreground">
                      {payable.shipmentRef}
                    </p>
                  )}
                  {payable.consolidationRef && (
                    <p className="text-xs text-muted-foreground">
                      {payable.consolidationRef}
                    </p>
                  )}
                  {payable.icumsRef && (
                    <p className="text-xs text-muted-foreground font-mono">
                      ICUMS: {payable.icumsRef}
                    </p>
                  )}
                  {payable.gphaRef && (
                    <p className="text-xs text-muted-foreground font-mono">
                      GPHA: {payable.gphaRef}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <p className="truncate" title={payable.description}>
                  {payable.description}
                </p>
                {payable.invoiceNumber && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Inv: {payable.invoiceNumber}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p className="font-semibold">
                    {formatCurrency(payable.amount, payable.currency)}
                  </p>
                  {payable.currency !== "GHS" && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(payable.ghsEquivalent)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    isOverdue && payable.status !== "paid"
                      ? "text-red-600 font-medium"
                      : ""
                  )}
                >
                  {payable.dueDate}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge 
                    className={cn(
                      payable.approvalStatus === "approved" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      payable.approvalStatus === "pending" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                      payable.approvalStatus === "rejected" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {payable.approvalStatus === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {payable.approvalStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {payable.approvalStatus === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                    {payable.approvalStatus.charAt(0).toUpperCase() + payable.approvalStatus.slice(1)}
                  </Badge>
                  {payable.approvedBy && (
                    <p className="text-xs text-muted-foreground">
                      by {payable.approvedBy}
                    </p>
                  )}
                  {payable.approvalDate && (
                    <p className="text-xs text-muted-foreground">
                      {payable.approvalDate}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[isOverdue && payable.status !== "paid" ? "overdue" : payable.status]}>
                  {isOverdue && payable.status !== "paid"
                    ? "Overdue"
                    : payable.status.charAt(0).toUpperCase() + payable.status.slice(1)}
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HistoryIcon className="h-4 w-4 mr-2" />
                      View Audit Trail
                    </DropdownMenuItem>
                    {payable.approvalStatus === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove?.(payable.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {payable.status === "approved" && (
                      <DropdownMenuItem onClick={() => onPay?.(payable.id)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
