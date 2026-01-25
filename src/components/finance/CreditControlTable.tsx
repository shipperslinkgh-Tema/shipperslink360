import { CustomerCredit } from "@/types/finance";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditControlTableProps {
  credits: CustomerCredit[];
  onReviewCredit?: (customerId: string) => void;
  onUpdateLimit?: (customerId: string) => void;
}

const creditStatusColors: Record<string, string> = {
  good: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  watch: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  hold: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  suspend: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const creditStatusIcons: Record<string, React.ElementType> = {
  good: CheckCircle,
  watch: Clock,
  hold: AlertTriangle,
  suspend: XCircle,
};

export function CreditControlTable({
  credits,
  onReviewCredit,
  onUpdateLimit,
}: CreditControlTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return "bg-red-500";
    if (rate >= 60) return "bg-amber-500";
    if (rate >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Credit Limit</TableHead>
          <TableHead className="text-right">Current Balance</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead>Utilization</TableHead>
          <TableHead>Payment History</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Next Review</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {credits.map((credit) => {
          const StatusIcon = creditStatusIcons[credit.creditStatus];
          const totalPayments =
            credit.paymentHistory.onTime + credit.paymentHistory.late;
          const onTimeRate =
            totalPayments > 0
              ? (credit.paymentHistory.onTime / totalPayments) * 100
              : 100;

          return (
            <TableRow key={credit.customerId}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon
                    className={cn(
                      "h-4 w-4",
                      credit.creditStatus === "good" && "text-green-600",
                      credit.creditStatus === "watch" && "text-amber-600",
                      credit.creditStatus === "hold" && "text-orange-600",
                      credit.creditStatus === "suspend" && "text-red-600"
                    )}
                  />
                  <span className="font-medium">{credit.customerName}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(credit.creditLimit)}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    credit.currentBalance > 0 ? "text-amber-600" : "text-muted-foreground"
                  )}
                >
                  {formatCurrency(credit.currentBalance)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-green-600 font-medium">
                  {formatCurrency(credit.availableCredit)}
                </span>
              </TableCell>
              <TableCell>
                <div className="w-24 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {credit.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={credit.utilizationRate}
                    className="h-2"
                    style={{
                      // @ts-ignore
                      "--progress-background": getUtilizationColor(
                        credit.utilizationRate
                      ),
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {onTimeRate >= 80 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="text-xs">
                      {credit.paymentHistory.onTime} on-time /{" "}
                      {credit.paymentHistory.late} late
                    </span>
                  </div>
                  {credit.paymentHistory.avgDaysLate > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Avg {credit.paymentHistory.avgDaysLate} days late
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={creditStatusColors[credit.creditStatus]}>
                  {credit.creditStatus.charAt(0).toUpperCase() +
                    credit.creditStatus.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {credit.nextReviewDate}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onReviewCredit?.(credit.customerId)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateLimit?.(credit.customerId)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Limit
                    </DropdownMenuItem>
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
