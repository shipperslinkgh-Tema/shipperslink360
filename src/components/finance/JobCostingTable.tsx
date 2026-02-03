import { JobProfitability } from "@/types/finance";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, TrendingUp, TrendingDown, Ship, Plane, Package, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobCostingTableProps {
  jobs: JobProfitability[];
  onViewJob?: (jobRef: string) => void;
}

const statusColors: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const categoryLabels: Record<string, string> = {
  freight_sea: "Sea Freight",
  freight_air: "Air Freight",
  customs_duty: "Customs Duty",
  customs_vat: "Customs VAT",
  gpha_charges: "GPHA Charges",
  shipping_line_do: "D/O Charges",
  demurrage: "Demurrage",
  detention: "Detention",
  trucking: "Trucking",
  warehousing: "Warehousing",
  documentation: "Documentation",
  handling: "Handling",
  insurance: "Insurance",
  agency_fee: "Agency Fee",
  other: "Other",
};

export function JobCostingTable({ jobs, onViewJob }: JobCostingTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 20) return "text-blue-600";
    if (margin >= 10) return "text-amber-600";
    return "text-red-600";
  };

  const getMarginBg = (margin: number) => {
    if (margin >= 30) return "bg-green-500";
    if (margin >= 20) return "bg-blue-500";
    if (margin >= 10) return "bg-amber-500";
    return "bg-red-500";
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case "shipment":
        return <Ship className="h-4 w-4 text-muted-foreground" />;
      case "consolidation":
        return <Package className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Plane className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Costs</TableHead>
            <TableHead className="text-right">Gross Profit</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Cost Breakdown</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.jobRef}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getJobTypeIcon(job.jobType)}
                  <div>
                    <p className="font-mono text-sm font-medium">{job.jobRef}</p>
                    <p className="text-xs text-muted-foreground">{job.reference}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{job.customer}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {job.jobType}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-green-600">
                    {formatCurrency(job.totalRevenue)}
                  </span>
                </div>
                {job.revenueBreakdown && job.revenueBreakdown.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {job.revenueBreakdown.length} invoice(s)
                  </p>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="font-medium text-red-600">
                    {formatCurrency(job.totalCosts)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn("font-bold", getMarginColor(job.grossMargin))}>
                  {formatCurrency(job.grossProfit)}
                </span>
              </TableCell>
              <TableCell>
                <div className="w-24 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn("font-medium", getMarginColor(job.grossMargin))}>
                      {job.grossMargin.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(job.grossMargin, 50)}
                    className="h-2"
                    style={{
                      // @ts-ignore
                      "--progress-background": getMarginBg(job.grossMargin),
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                  {job.costBreakdown.slice(0, 3).map((cost, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs cursor-help">
                          {categoryLabels[cost.category]?.split(" ")[0] || cost.category}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{categoryLabels[cost.category] || cost.category}</p>
                        <p className="font-semibold">{formatCurrency(cost.amount)}</p>
                        <p className="text-xs text-muted-foreground">{cost.percentage.toFixed(1)}% of costs</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {job.costBreakdown.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.costBreakdown.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[job.status]}>
                  {job.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewJob?.(job.jobRef)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
