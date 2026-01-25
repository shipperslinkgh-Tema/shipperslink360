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
import { Eye, TrendingUp, TrendingDown, Ship, Plane } from "lucide-react";
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

  return (
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
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.jobRef}>
            <TableCell>
              <div className="flex items-center gap-2">
                {job.jobType === "shipment" ? (
                  <Ship className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Plane className="h-4 w-4 text-muted-foreground" />
                )}
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
              <Badge className={statusColors[job.status]}>
                {job.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewJob?.(job.jobRef)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
