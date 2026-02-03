import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  RefreshCw,
  Banknote,
  AlertCircle,
  Calendar,
  Receipt,
} from "lucide-react";
import { FinanceDashboardMetrics, AgingSummary, ExchangeRate } from "@/types/finance";
import { cn } from "@/lib/utils";

interface FinanceDashboardProps {
  metrics: FinanceDashboardMetrics;
  agingSummary: AgingSummary;
  exchangeRates?: ExchangeRate[];
  alerts?: FinancialAlert[];
}

interface FinancialAlert {
  id: string;
  type: "overdue_invoice" | "overdue_payable" | "tax_due" | "renewal_expiring" | "credit_limit" | "low_balance";
  title: string;
  description: string;
  amount?: number;
  dueDate?: string;
  severity: "critical" | "warning" | "info";
}

export function FinanceDashboard({ 
  metrics, 
  agingSummary, 
  exchangeRates = [],
  alerts = []
}: FinanceDashboardProps) {
  const formatCurrency = (amount: number, compact = false, currency = "GHS") => {
    if (compact && Math.abs(amount) >= 1000) {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: currency,
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
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

  // Default alerts based on metrics
  const defaultAlerts: FinancialAlert[] = [
    ...(metrics.overdueInvoices > 0
      ? [
          {
            id: "overdue-inv",
            type: "overdue_invoice" as const,
            title: "Overdue Invoices",
            description: `${formatCurrency(metrics.overdueInvoices)} past due date`,
            amount: metrics.overdueInvoices,
            severity: "critical" as const,
          },
        ]
      : []),
    ...(metrics.pendingPayables > 0
      ? [
          {
            id: "pending-pay",
            type: "overdue_payable" as const,
            title: "Pending Payables",
            description: `${formatCurrency(metrics.pendingPayables)} awaiting payment`,
            amount: metrics.pendingPayables,
            severity: "warning" as const,
          },
        ]
      : []),
    {
      id: "dpo",
      type: "tax_due" as const,
      title: "Days Payables Outstanding",
      description: `${metrics.dpo} days average payment cycle`,
      severity: "info" as const,
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <PieChart className="h-4 w-4 text-blue-600" />;
    }
  };

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

      {/* Second Row - Exchange Rates and YTD Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Exchange Rates Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                Exchange Rates
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {exchangeRates.length > 0 ? (
              exchangeRates
                .filter((rate) => rate.from !== "GHS")
                .map((rate) => (
                  <div
                    key={`${rate.from}-${rate.to}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{rate.from}/GHS</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{rate.rate.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{rate.date}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">USD/GHS</span>
                  </div>
                  <p className="font-semibold">15.50</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">EUR/GHS</span>
                  </div>
                  <p className="font-semibold">16.80</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">GBP/GHS</span>
                  </div>
                  <p className="font-semibold">19.50</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">CNY/GHS</span>
                  </div>
                  <p className="font-semibold">2.15</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* YTD Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Year-to-Date Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">YTD Revenue</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(metrics.ytdRevenue, true)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">YTD Costs</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(metrics.ytdCosts, true)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">YTD Profit</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(metrics.ytdProfit, true)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">YTD Margin</p>
                <p className="text-lg font-bold">{metrics.ytdMargin.toFixed(1)}%</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Invoices</span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(metrics.pendingInvoices)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payables Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Payables Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-amber-600">
                  {formatCurrency(metrics.pendingPayables, true)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(metrics.overduePayables, true)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days Payables Outstanding</span>
                <Badge variant="outline">{metrics.dpo} days</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days Sales Outstanding</span>
                <Badge variant="outline">{metrics.dso} days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Alerts and Aging */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Financial Alerts
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {displayAlerts.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  getSeverityStyles(alert.severity)
                )}
              >
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
                {alert.amount && (
                  <Badge
                    variant={alert.severity === "critical" ? "destructive" : "secondary"}
                  >
                    {formatCurrency(alert.amount)}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Aging Analysis Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Receivables Aging Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
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
                    <div className={cn("w-3 h-3 rounded-full", bucket.color)} />
                    <span className="text-muted-foreground">{bucket.label}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(bucket.value)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Total Outstanding</span>
                <p className="text-xs text-muted-foreground">
                  {agingSummary.customerCount} customers
                </p>
              </div>
              <span className="text-xl font-bold">{formatCurrency(agingSummary.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
