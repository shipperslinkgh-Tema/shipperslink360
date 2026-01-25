import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { FinanceDashboardMetrics, AgingSummary } from "@/types/finance";
import { cn } from "@/lib/utils";

interface FinanceDashboardProps {
  metrics: FinanceDashboardMetrics;
  agingSummary: AgingSummary;
}

export function FinanceDashboard({ metrics, agingSummary }: FinanceDashboardProps) {
  const formatCurrency = (amount: number, compact = false) => {
    if (compact && Math.abs(amount) >= 1000) {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const kpiCards: Array<{
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
  }> = [
    {
      title: "MTD Revenue",
      value: formatCurrency(metrics.mtdRevenue, true),
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "MTD Profit",
      value: formatCurrency(metrics.mtdProfit, true),
      change: `${metrics.mtdMargin.toFixed(1)}% margin`,
      trend: "up",
      icon: DollarSign,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Receivables",
      value: formatCurrency(metrics.pendingInvoices, true),
      change: `${metrics.dso} days DSO`,
      trend: "neutral",
      icon: FileText,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Cash Position",
      value: formatCurrency(metrics.cashPosition, true),
      change: "All accounts",
      trend: "up",
      icon: Wallet,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const agingBuckets = [
    { label: "Current", value: agingSummary.current, color: "bg-green-500" },
    { label: "1-30 Days", value: agingSummary.days1to30, color: "bg-yellow-500" },
    { label: "31-60 Days", value: agingSummary.days31to60, color: "bg-orange-500" },
    { label: "61-90 Days", value: agingSummary.days61to90, color: "bg-red-400" },
    { label: "90+ Days", value: agingSummary.days90plus, color: "bg-red-600" },
  ];

  const totalAging = agingSummary.total || 1;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.trend === "up" && (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    )}
                    {kpi.trend === "down" && (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={cn(
                        kpi.trend === "up" && "text-green-600",
                        kpi.trend === "down" && "text-red-600",
                        kpi.trend === "neutral" && "text-muted-foreground"
                      )}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg", kpi.bgColor)}>
                  <kpi.icon className={cn("h-6 w-6", kpi.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second Row - Alerts and Aging */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.overdueInvoices > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Overdue Invoices
                  </span>
                </div>
                <Badge variant="destructive">
                  {formatCurrency(metrics.overdueInvoices)}
                </Badge>
              </div>
            )}
            {metrics.pendingPayables > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Pending Payables
                  </span>
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {formatCurrency(metrics.pendingPayables)}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Days Payables Outstanding
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {metrics.dpo} days
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Aging Analysis Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Receivables Aging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {agingBuckets.map((bucket) => {
                const width = (bucket.value / totalAging) * 100;
                return width > 0 ? (
                  <div
                    key={bucket.label}
                    className={cn("transition-all", bucket.color)}
                    style={{ width: `${width}%` }}
                    title={`${bucket.label}: ${formatCurrency(bucket.value)}`}
                  />
                ) : null;
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {agingBuckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", bucket.color)} />
                    <span className="text-muted-foreground">{bucket.label}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(bucket.value)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="text-sm font-medium">Total Outstanding</span>
              <span className="text-lg font-bold">{formatCurrency(agingSummary.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
