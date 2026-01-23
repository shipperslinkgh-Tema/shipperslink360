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
import { Eye, Send, Download, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoicesTableProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
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
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{invoice.customer}</p>
                {invoice.shipmentRef && (
                  <p className="text-xs text-muted-foreground">{invoice.shipmentRef}</p>
                )}
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={invoice.description}>
              {invoice.description}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-semibold">{formatCurrency(invoice.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  Tax: {formatCurrency(invoice.taxAmount)}
                </p>
              </div>
            </TableCell>
            <TableCell>{invoice.issueDate}</TableCell>
            <TableCell>
              <span className={invoice.status === "overdue" ? "text-red-600 font-medium" : ""}>
                {invoice.dueDate}
              </span>
            </TableCell>
            <TableCell>
              <Badge className={statusColors[invoice.status]}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                  {invoice.status === "draft" && (
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invoice
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
