import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Printer,
} from "lucide-react";
import { FinanceDashboardMetrics, AgingSummary } from "@/types/finance";
import { cn } from "@/lib/utils";

interface FinancialReportsProps {
  metrics: FinanceDashboardMetrics;
  agingSummary: AgingSummary;
}

export function FinancialReports({ metrics, agingSummary }: FinancialReportsProps) {
  const [reportPeriod, setReportPeriod] = useState("mtd");

  const formatCurrency = (amount: number) => {
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

  return (
    <div className="space-y-6">
      {/* Report Controls */}
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

      <Tabs defaultValue="pl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pl" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="aging" className="gap-2">
            <PieChart className="h-4 w-4" />
            Aging Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profit & Loss Statement</CardTitle>
                <Badge variant="outline">
                  {reportPeriod === "mtd" ? "January 2026" : "Jan - Dec 2026"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  Revenue
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between py-2 border-b">
                    <span>Freight Forwarding Services</span>
                    <span className="font-medium">{formatCurrency(plData.revenue * 0.45)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Customs Clearing</span>
                    <span className="font-medium">{formatCurrency(plData.revenue * 0.25)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Trucking & Transport</span>
                    <span className="font-medium">{formatCurrency(plData.revenue * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Warehousing</span>
                    <span className="font-medium">{formatCurrency(plData.revenue * 0.10)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Agency & Documentation Fees</span>
                    <span className="font-medium">{formatCurrency(plData.revenue * 0.05)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-green-600">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(plData.revenue)}</span>
                  </div>
                </div>
              </div>

              {/* Cost of Sales */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  Cost of Sales
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between py-2 border-b">
                    <span>Freight Costs (Sea & Air)</span>
                    <span className="font-medium">{formatCurrency(plData.costs * 0.50)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Port & Terminal Charges (GPHA)</span>
                    <span className="font-medium">{formatCurrency(plData.costs * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Shipping Line DO Charges</span>
                    <span className="font-medium">{formatCurrency(plData.costs * 0.10)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Trucking Expenses</span>
                    <span className="font-medium">{formatCurrency(plData.costs * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Other Direct Costs</span>
                    <span className="font-medium">{formatCurrency(plData.costs * 0.10)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-red-600">
                    <span>Total Cost of Sales</span>
                    <span>{formatCurrency(plData.costs)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Gross Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Margin: {plData.margin.toFixed(1)}%
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(plData.grossProfit)}
                  </span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Operating Expenses</h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between py-2 border-b">
                    <span>Staff Salaries & Benefits</span>
                    <span className="font-medium">{formatCurrency(plData.expenses * 0.40)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Office Rent & Utilities</span>
                    <span className="font-medium">{formatCurrency(plData.expenses * 0.20)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Vehicle & Fuel</span>
                    <span className="font-medium">{formatCurrency(plData.expenses * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Administrative Expenses</span>
                    <span className="font-medium">{formatCurrency(plData.expenses * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Bank Charges & Interest</span>
                    <span className="font-medium">{formatCurrency(plData.expenses * 0.10)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total Operating Expenses</span>
                    <span>{formatCurrency(plData.expenses)}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Net Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Net Margin: {netMargin.toFixed(1)}%
                    </p>
                  </div>
                  <span className={cn(
                    "text-2xl font-bold",
                    netProfit >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cash Flow Statement</CardTitle>
                <Badge variant="outline">
                  {reportPeriod === "mtd" ? "January 2026" : "Jan - Dec 2026"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cash Inflows */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Cash Inflows
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between py-2 border-b">
                    <span>Collections from Clients</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(metrics.cashPosition * 0.65)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Duty/Tax Reimbursements</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(metrics.cashPosition * 0.25)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Other Receipts</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(metrics.cashPosition * 0.10)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-green-600">
                    <span>Total Inflows</span>
                    <span>+{formatCurrency(metrics.cashPosition)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Outflows */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Cash Outflows
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between py-2 border-b">
                    <span>Shipping Line Payments</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(metrics.pendingPayables * 0.40)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>GPHA & Port Charges</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(metrics.pendingPayables * 0.20)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Customs Duty Payments</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(metrics.pendingPayables * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Operating Expenses</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(metrics.pendingPayables * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Staff Salaries</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(metrics.pendingPayables * 0.10)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-red-600">
                    <span>Total Outflows</span>
                    <span>-{formatCurrency(metrics.pendingPayables)}</span>
                  </div>
                </div>
              </div>

              {/* Net Cash Position */}
              <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Net Cash Position</h3>
                    <p className="text-sm text-muted-foreground">
                      Available across all accounts
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(metrics.cashPosition)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Accounts Receivable Aging Report</CardTitle>
                <Badge variant="outline">As at Feb 5, 2026</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Aging Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(agingSummary.current)}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">1-30 Days</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(agingSummary.days1to30)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">31-60 Days</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(agingSummary.days31to60)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">61-90 Days</p>
                  <p className="text-xl font-bold text-red-500">
                    {formatCurrency(agingSummary.days61to90)}
                  </p>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">90+ Days</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(agingSummary.days90plus)}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Total Outstanding</h3>
                    <p className="text-sm text-muted-foreground">
                      {agingSummary.customerCount} customers with outstanding balances
                    </p>
                  </div>
                  <span className="text-2xl font-bold">
                    {formatCurrency(agingSummary.total)}
                  </span>
                </div>
              </div>

              {/* Collection Priority */}
              <div className="space-y-3">
                <h3 className="font-semibold">Collection Priority</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div>
                      <p className="font-medium">High Priority (90+ Days)</p>
                      <p className="text-sm text-muted-foreground">Immediate follow-up required</p>
                    </div>
                    <Badge variant="destructive">{formatCurrency(agingSummary.days90plus)}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div>
                      <p className="font-medium">Medium Priority (31-90 Days)</p>
                      <p className="text-sm text-muted-foreground">Schedule payment reminders</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      {formatCurrency(agingSummary.days31to60 + agingSummary.days61to90)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <p className="font-medium">Normal (Current + 1-30 Days)</p>
                      <p className="text-sm text-muted-foreground">Standard collection process</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {formatCurrency(agingSummary.current + agingSummary.days1to30)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
