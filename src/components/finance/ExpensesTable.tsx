import { OfficeExpense } from "@/types/finance";
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
import { Check, X, Eye } from "lucide-react";

interface ExpensesTableProps {
  expenses: OfficeExpense[];
}

const categoryLabels: Record<string, string> = {
  rent: "Rent",
  utilities: "Utilities",
  supplies: "Supplies",
  maintenance: "Maintenance",
  transport: "Transport",
  salary: "Salary",
  tax: "Tax",
  insurance: "Insurance",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  rent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  utilities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  supplies: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  transport: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  salary: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  tax: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  insurance: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ExpensesTable({ expenses }: ExpensesTableProps) {
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
          <TableHead>Reference</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-mono text-sm">{expense.expenseRef}</TableCell>
            <TableCell>
              <Badge className={categoryColors[expense.category]}>
                {categoryLabels[expense.category]}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{expense.description}</p>
                {expense.notes && (
                  <p className="text-xs text-muted-foreground">{expense.notes}</p>
                )}
              </div>
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(expense.amount)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{expense.accountName}</TableCell>
            <TableCell>{expense.requestedBy}</TableCell>
            <TableCell>
              <Badge className={statusColors[expense.status]}>
                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {expense.status === "pending" && (
                  <>
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
