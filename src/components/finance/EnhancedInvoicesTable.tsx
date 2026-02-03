import { Invoice } from "@/types/finance";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Send,
  Download,
  MoreHorizontal,
  Copy,
  FileText,
  Receipt,
  CreditCard,
  CheckCircle,
  XCircle,
  Edit,
  History,
  Clock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedInvoicesTableProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onSend?: (invoiceId: string) => void;
  onConvertToCommercial?: (invoiceId: string) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  partially_paid: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  disputed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const invoiceTypeColors: Record<string, string> = {
  proforma: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  commercial: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  credit_note: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  debit_note: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const invoiceTypeLabels: Record<string, string> = {
  proforma: "Proforma",
  commercial: "Commercial",
  credit_note: "Credit Note",
  debit_note: "Debit Note",
};

const invoiceTypeIcons: Record<string, React.ElementType> = {
  proforma: FileText,
  commercial: Receipt,
  credit_note: CreditCard,
  debit_note: CreditCard,
};

export function EnhancedInvoicesTable({
  invoices,
  onView,
  onSend,
  onConvertToCommercial,
}: EnhancedInvoicesTableProps) {
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
          <TableHead>Invoice</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Job Reference</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const TypeIcon = invoiceTypeIcons[invoice.invoiceType] || FileText;
          const isOverdue =
            invoice.status !== "paid" &&
            invoice.status !== "cancelled" &&
            new Date(invoice.dueDate) < new Date();
          const outstanding = invoice.totalAmount - invoice.paidAmount;

          return (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.issueDate}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={invoiceTypeColors[invoice.invoiceType]}>
                  {invoiceTypeLabels[invoice.invoiceType]}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invoice.customer}</p>
                  {invoice.shipmentRef && (
                    <p className="text-xs text-muted-foreground">
                      {invoice.shipmentRef}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  {invoice.jobRef ? (
                    <span className="font-mono text-xs">{invoice.jobRef}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  {invoice.consolidationRef && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {invoice.consolidationRef}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p
                    className={cn(
                      "font-semibold",
                      invoice.invoiceType === "credit_note" && "text-green-600"
                    )}
                  >
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </p>
                  {invoice.currency !== "GHS" && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(invoice.ghsEquivalent)}
                    </p>
                  )}
                  {invoice.lineItems && invoice.lineItems.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {invoice.lineItems.length} line items
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p className="text-green-600">
                    {formatCurrency(invoice.paidAmount, invoice.currency)}
                  </p>
                  {outstanding > 0 && invoice.invoiceType !== "credit_note" && (
                    <p className="text-xs text-amber-600">
                      Due: {formatCurrency(outstanding, invoice.currency)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    isOverdue ? "text-red-600 font-medium" : ""
                  )}
                >
                  {invoice.dueDate}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {invoice.approvedBy ? (
                    <>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Approved</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {invoice.approvedBy}
                      </p>
                      {invoice.approvalDate && (
                        <p className="text-xs text-muted-foreground">
                          {invoice.approvalDate}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span className="text-xs text-amber-600">Pending</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    statusColors[isOverdue ? "overdue" : invoice.status]
                  }
                >
                  {isOverdue
                    ? "Overdue"
                    : invoice.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                    <DropdownMenuItem onClick={() => onView?.(invoice)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History className="h-4 w-4 mr-2" />
                      View Audit Trail
                    </DropdownMenuItem>
                    {invoice.status === "draft" && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSend?.(invoice.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Invoice
                        </DropdownMenuItem>
                      </>
                    )}
                    {invoice.invoiceType === "proforma" &&
                      invoice.status !== "cancelled" && (
                        <DropdownMenuItem
                          onClick={() => onConvertToCommercial?.(invoice.id)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Convert to Commercial
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    {invoice.status !== "cancelled" &&
                      invoice.status !== "paid" && (
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                    {invoice.status === "draft" && (
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Invoice
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
