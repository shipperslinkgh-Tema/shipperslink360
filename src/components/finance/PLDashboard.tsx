import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Printer,
  Wallet,
  PieChart,
  Target,
  Banknote,
  Receipt,
  Clock,
} from "lucide-react";
import { FinanceDashboardMetrics, AgingSummary } from "@/types/finance";
import { cn } from "@/lib/utils";

interface PLDashboardProps {
  metrics: FinanceDashboardMetrics;
  agingSummary: AgingSummary;
}

export function PLDashboard({ metrics, agingSummary }: PLDashboardProps) {
  const [reportPeriod, setReportPeriod] = useState("mtd");

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

  const plData = {
    revenue: reportPeriod === "mtd" ? metrics.mtdRevenue : metrics.ytdRevenue,
    costs: reportPeriod === "mtd" ? metrics.mtdCosts : metrics.ytdCosts,
    grossProfit: reportPeriod === "mtd" ? metrics.mtdProfit : metrics.ytdProfit,
    margin: reportPeriod === "mtd" ? metrics.mtdMargin : metrics.ytdMargin,
    expenses: Math.floor((reportPeriod === "mtd" ? metrics.mtdRevenue : metrics.ytdRevenue) * 0.15),
  };

  const netProfit = plData.grossProfit - plData.expenses;
  const netMargin = (netProfit / plData.revenue) * 100;
  const targetRevenue = reportPeriod === "mtd" ? 500000 : 6000000;
  const revenueProgress = (plData.revenue / targetRevenue) * 100;

  // Revenue breakdown
  const revenueBreakdown = [
    { label: "Freight Forwarding", value: plData.revenue * 0.45, color: "bg-blue-500" },
    { label: "Customs Clearing", value: plData.revenue * 0.25, color: "bg-green-500" },
    { label: "Trucking", value: plData.revenue * 0.15, color: "bg-amber-500" },
    { label: "Warehousing", value: plData.revenue * 0.10, color: "bg-purple-500" },
    { label: "Agency Fees", value: plData.revenue * 0.05, color: "bg-pink-500" },
  ];

  // Cost breakdown
  const costBreakdown = [
    { label: "Freight Costs", value: plData.costs * 0.50 },
    { label: "Port Charges", value: plData.costs * 0.15 },
    { label: "DO Charges", value: plData.costs * 0.10 },
    { label: "Trucking", value: plData.costs * 0.15 },
    { label: "Other", value: plData.costs * 0.10 },
  ];

  // Expense breakdown
  const expenseBreakdown = [
    { label: "Salaries", value: plData.expenses * 0.40, percentage: 40 },
    { label: "Rent & Utilities", value: plData.expenses * 0.20, percentage: 20 },
    { label: "Vehicle & Fuel", value: plData.expenses * 0.15, percentage: 15 },
    { label: "Admin", value: plData.expenses * 0.15, percentage: 15 },
    { label: "Bank Charges", value: plData.expenses * 0.10, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="q1">Q1 2026</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            {reportPeriod === "mtd" ? "February 2026" : "Jan - Feb 2026"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(plData.revenue, true)}</p>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+12.5% vs last period</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Target Progress</span>
                <span className="font-medium">{revenueProgress.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(revenueProgress, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Costs Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cost of Sales</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(plData.costs, true)}</p>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-muted-foreground">{((plData.costs / plData.revenue) * 100).toFixed(1)}% of revenue</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gross Profit</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(plData.grossProfit, true)}</p>
                <div className="flex items-center gap-1 text-xs">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600">{plData.margin.toFixed(1)}% margin</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className="relative overflow-hidden border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={cn("text-2xl font-bold", netProfit >= 0 ? "text-primary" : "text-red-600")}>
                  {formatCurrency(netProfit, true)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-muted-foreground">{netMargin.toFixed(1)}% net margin</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Revenue & Cost Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-green-600" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual Bar */}
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              {revenueBreakdown.map((item) => {
                const width = (item.value / plData.revenue) * 100;
                return (
                  <div
                    key={item.label}
                    className={cn("transition-all", item.color)}
                    style={{ width: `${width}%` }}
                    title={`${item.label}: ${formatCurrency(item.value)}`}
                  />
                );
              })}
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {revenueBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((item.value / plData.revenue) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4 text-red-600" />
              Cost of Sales Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {costBreakdown.map((item) => {
              const percentage = (item.value / plData.costs) * 100;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            <div className="pt-2 border-t flex justify-between items-center font-bold">
              <span>Total Costs</span>
              <span className="text-red-600">{formatCurrency(plData.costs)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Operating Expenses & Cash Flow Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Operating Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="pt-2 border-t flex justify-between items-center font-bold">
              <span>Total OPEX</span>
              <span>{formatCurrency(plData.expenses)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Position */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Cash Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-primary">{formatCurrency(metrics.cashPosition)}</p>
              <p className="text-sm text-muted-foreground mt-1">Available Balance</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Inflows (MTD)</p>
                <p className="text-sm font-bold text-green-600">+{formatCurrency(metrics.cashPosition * 0.3, true)}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Outflows (MTD)</p>
                <p className="text-sm font-bold text-red-600">-{formatCurrency(metrics.pendingPayables * 0.5, true)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receivables Aging Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Receivables Aging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(agingSummary.current)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">1-30 Days</span>
              <span className="text-sm font-medium text-yellow-600">{formatCurrency(agingSummary.days1to30)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">31-60 Days</span>
              <span className="text-sm font-medium text-orange-600">{formatCurrency(agingSummary.days31to60)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">61-90 Days</span>
              <span className="text-sm font-medium text-red-500">{formatCurrency(agingSummary.days61to90)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">90+ Days</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(agingSummary.days90plus)}</span>
            </div>
            <div className="pt-2 border-t flex justify-between items-center font-bold">
              <span>Total Outstanding</span>
              <span className="text-amber-600">{formatCurrency(agingSummary.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row - P&L Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Profit & Loss Summary</CardTitle>
            <Badge variant="outline">
              {reportPeriod === "mtd" ? "February 2026" : "Jan - Feb 2026"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y">
                <tr className="bg-green-50 dark:bg-green-900/10">
                  <td className="px-4 py-3 font-medium">Total Revenue</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {formatCurrency(plData.revenue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground pl-8">Less: Cost of Sales</td>
                  <td className="px-4 py-3 text-right text-red-600">
                    ({formatCurrency(plData.costs)})
                  </td>
                </tr>
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td className="px-4 py-3 font-medium">Gross Profit</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    {formatCurrency(plData.grossProfit)}
                    <span className="text-xs text-muted-foreground ml-2">({plData.margin.toFixed(1)}%)</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground pl-8">Less: Operating Expenses</td>
                  <td className="px-4 py-3 text-right text-red-600">
                    ({formatCurrency(plData.expenses)})
                  </td>
                </tr>
                <tr className="bg-primary/5 border-t-2 border-primary">
                  <td className="px-4 py-4 font-bold text-lg">Net Profit</td>
                  <td className={cn(
                    "px-4 py-4 text-right font-bold text-xl",
                    netProfit >= 0 ? "text-primary" : "text-red-600"
                  )}>
                    {formatCurrency(netProfit)}
                    <span className="text-sm text-muted-foreground ml-2">({netMargin.toFixed(1)}%)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
