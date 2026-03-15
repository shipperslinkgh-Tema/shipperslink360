import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Package, DollarSign, Users, Warehouse,
  FileText, Download, Calendar, RefreshCw, AlertTriangle,
  CheckCircle, Clock, Ship, Plane, Truck, Target, Activity,
  ArrowUpRight, ArrowDownRight, Search, Brain, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMonthlyFinancials, useOperationsStats, useFinanceSummary, useClientAnalytics, useTruckingStats } from "@/hooks/useReportsData";
import { useFinanceInvoices } from "@/hooks/useFinanceData";
import { autoExportCSV } from "@/lib/dataExport";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// ── Helpers ──
const fmt = (n: number, compact = false) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency", currency: "GHS",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(38 92% 60%)",
  "hsl(var(--success))",
  "hsl(var(--muted-foreground))",
];

// ── Sub-components ──
function KPICard({ label, value, prev, prevLabel, icon: Icon, color, bg, positive }: {
  label: string; value: number | string; prev?: number; prevLabel?: string;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string; positive: boolean;
}) {
  const isNum = typeof value === "number";
  const change = isNum && typeof prev === "number" && prev > 0
    ? ((value - prev) / prev * 100).toFixed(1)
    : null;

  return (
    <Card className="metric-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {isNum ? fmt(value as number, true) : value}
            </p>
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", positive ? "text-success" : "text-warning")}>
              {change ? (
                <>
                  {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{change}% vs prior period</span>
                </>
              ) : (
                <span className="text-muted-foreground">{prevLabel || "—"}</span>
              )}
            </div>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    high: "bg-warning/10 text-warning border-warning/20",
    medium: "bg-info/10 text-info border-info/20",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", map[severity] || map.low)}>
      {severity}
    </span>
  );
}

function ShipmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Delivered": "status-badge status-success",
    "In Transit": "status-badge status-info",
    "Customs": "status-badge status-warning",
    "At Port": "status-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "Pending": "status-badge status-pending",
  };
  return <span className={map[status] || "status-badge status-pending"}>{status}</span>;
}

type ShipmentType = "all" | "sea" | "air" | "road";

// ── Main Page ──
export default function Reports() {
  const { department } = useAuth();
  const queryClient = useQueryClient();
  const [shipmentType, setShipmentType] = useState<ShipmentType>("all");
  const [searchOps, setSearchOps] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [activeTab, setActiveTab] = useState("management");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real data hooks
  const { data: monthlyData, isLoading: loadingMonthly } = useMonthlyFinancials();
  const { data: opsStats, isLoading: loadingOps } = useOperationsStats();
  const { data: financeSummary, isLoading: loadingFinance } = useFinanceSummary();
  const { data: clientData, isLoading: loadingClients } = useClientAnalytics();
  const { data: truckingStats } = useTruckingStats();
  const { data: invoices = [] } = useFinanceInvoices();

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["reports-monthly-financials"] });
    queryClient.invalidateQueries({ queryKey: ["reports-operations-stats"] });
    queryClient.invalidateQueries({ queryKey: ["reports-finance-summary"] });
    queryClient.invalidateQueries({ queryKey: ["reports-client-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["reports-trucking-stats"] });
    queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
    setTimeout(() => setIsRefreshing(false), 1200);
    toast.success("Reports refreshed");
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(data, filename);
    toast.success(`Exported ${filename}.csv`);
  };

  const filteredOps = useMemo(() =>
    (opsStats?.rows || []).filter(r => {
      const matchType = shipmentType === "all" || r.type.toLowerCase() === shipmentType;
      const matchSearch = !searchOps || r.bl.toLowerCase().includes(searchOps.toLowerCase()) || r.customer.toLowerCase().includes(searchOps.toLowerCase());
      return matchType && matchSearch;
    }), [shipmentType, searchOps, opsStats]);

  const filteredClients = useMemo(() =>
    (clientData?.clientRows || []).filter(c => !searchClient || c.client.toLowerCase().includes(searchClient.toLowerCase())),
    [searchClient, clientData]);

  // Department-based tab access
  const allowedTabs = useMemo(() => {
    if (!department || department === "super_admin" || department === "management") {
      return ["management", "operations", "finance", "warehouse", "clients"];
    }
    if (department === "accounts") return ["finance", "clients"];
    if (department === "operations" || department === "documentation") return ["operations"];
    if (department === "warehouse") return ["warehouse"];
    return ["operations"];
  }, [department]);

  // Pie chart data from real ops stats
  const shipmentsByStatus = useMemo(() => {
    if (!opsStats) return [];
    return Object.entries(opsStats.statusCounts).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [opsStats]);

  // Department performance from real data
  const departmentPerf = useMemo(() => {
    const clearanceTarget = 3;
    const clearanceActual = opsStats?.avgClearanceDays || 0;
    const truckCompletion = truckingStats?.completionRate || 0;
    const invoiceAccuracy = financeSummary ? Math.round(((financeSummary.invoiceCount - financeSummary.overdueCount) / Math.max(financeSummary.invoiceCount, 1)) * 100) : 0;
    const deliveryRate = opsStats ? Math.round((opsStats.delivered / Math.max(opsStats.total, 1)) * 100) : 0;

    return [
      { dept: "Operations", target: 95, actual: Math.min(deliveryRate, 100), kpi: "Delivery Completion" },
      { dept: "Customs", target: clearanceTarget, actual: clearanceActual, kpi: `Avg Clearance (${clearanceActual} days)`, isTime: true },
      { dept: "Finance", target: 98, actual: invoiceAccuracy, kpi: "Invoice Accuracy" },
      { dept: "Trucking", target: 92, actual: truckCompletion, kpi: "Trip Completion" },
    ];
  }, [opsStats, truckingStats, financeSummary]);

  // Risk alerts from real data
  const riskAlerts = useMemo(() => {
    const alerts: { type: string; item: string; detail: string; severity: string }[] = [];

    if (financeSummary && financeSummary.overdueCount > 0) {
      alerts.push({
        type: "Overdue Invoices",
        item: `${financeSummary.overdueCount} invoice(s)`,
        detail: `${fmt(financeSummary.totalOutstanding)} in outstanding receivables`,
        severity: financeSummary.overdueCount > 3 ? "critical" : "high",
      });
    }

    if (opsStats && opsStats.delayed > 0) {
      alerts.push({
        type: "Delayed Shipments",
        item: `${opsStats.delayed} shipment(s)`,
        detail: "Past ETA and not yet delivered",
        severity: opsStats.delayed > 5 ? "critical" : "high",
      });
    }

    if (financeSummary && financeSummary.totalPayables > 50000) {
      alerts.push({
        type: "Pending Payables",
        item: fmt(financeSummary.totalPayables),
        detail: "Vendor payments pending approval",
        severity: financeSummary.totalPayables > 200000 ? "high" : "medium",
      });
    }

    if (clientData) {
      const highExposure = clientData.clientRows.filter(c => c.creditLimit > 0 && (c.outstanding / c.creditLimit) > 0.75);
      highExposure.forEach(c => {
        alerts.push({
          type: "Credit Limit Risk",
          item: c.client,
          detail: `${Math.round((c.outstanding / c.creditLimit) * 100)}% of limit used`,
          severity: (c.outstanding / c.creditLimit) > 0.9 ? "critical" : "high",
        });
      });
    }

    return alerts.slice(0, 6);
  }, [financeSummary, opsStats, clientData]);

  const isLoading = loadingMonthly || loadingOps || loadingFinance || loadingClients;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiData = [
    { label: "Total Revenue", value: financeSummary?.totalRevenue || 0, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", positive: true, prevLabel: "All paid invoices" },
    { label: "Active Consignments", value: String(opsStats?.total || 0), icon: Package, color: "text-info", bg: "bg-info/10", positive: true, prevLabel: `${opsStats?.delivered || 0} delivered` },
    { label: "Clearance Speed", value: `${opsStats?.avgClearanceDays || 0} days`, icon: Clock, color: "text-success", bg: "bg-success/10", positive: true, prevLabel: "Average customs-to-release" },
    { label: "Outstanding", value: financeSummary?.totalOutstanding || 0, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", positive: false, prevLabel: `${financeSummary?.overdueCount || 0} overdue` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live business intelligence · Shippers Link Agencies Co., Ltd
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCSV(opsStats?.rows || [], "operations-report")} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* ── KPI Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((k) => (
          <KPICard key={k.label} {...k} value={typeof k.value === "string" ? k.value : k.value} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted">
          {allowedTabs.includes("management") && (
            <TabsTrigger value="management" className="gap-1.5 text-xs sm:text-sm">
              <Target className="h-4 w-4" /> Management
            </TabsTrigger>
          )}
          {allowedTabs.includes("operations") && (
            <TabsTrigger value="operations" className="gap-1.5 text-xs sm:text-sm">
              <Package className="h-4 w-4" /> Operations
            </TabsTrigger>
          )}
          {allowedTabs.includes("finance") && (
            <TabsTrigger value="finance" className="gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-4 w-4" /> Finance
            </TabsTrigger>
          )}
          {allowedTabs.includes("warehouse") && (
            <TabsTrigger value="warehouse" className="gap-1.5 text-xs sm:text-sm">
              <Warehouse className="h-4 w-4" /> Warehouse
            </TabsTrigger>
          )}
          {allowedTabs.includes("clients") && (
            <TabsTrigger value="clients" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" /> Clients
            </TabsTrigger>
          )}
        </TabsList>

        {/* ═══ TAB: MANAGEMENT ═══ */}
        <TabsContent value="management" className="space-y-6 mt-6">
          {/* Revenue Trend + Shipment Status */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Revenue vs Expenses (6 months)</CardTitle>
                <CardDescription>Monthly P&L trend in GHS from actual invoices &amp; expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {(monthlyData && monthlyData.length > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(210,100%,40%)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(210,100%,40%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0,84%,60%)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(210,100%,40%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(0,84%,60%)" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
                      <Line type="monotone" dataKey="profit" stroke="hsl(160,84%,39%)" strokeWidth={2.5} dot={{ r: 4 }} name="Net Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                    No financial data available for the last 6 months
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Consignments by Status</CardTitle>
                <CardDescription>Current distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {shipmentsByStatus.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <RechartsPie>
                        <Pie data={shipmentsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {shipmentsByStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {shipmentsByStatus.map((s) => (
                        <div key={s.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-muted-foreground">{s.name}</span>
                          </div>
                          <span className="font-semibold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No consignment data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Department Performance + Risk Alerts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Department Performance
                </CardTitle>
                <CardDescription>KPI achievement computed from live data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentPerf.map((d) => (
                    <div key={d.dept}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm font-medium">{d.dept}</span>
                          <span className="text-xs text-muted-foreground ml-2">{d.kpi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold",
                            d.isTime ? (d.actual <= d.target ? "text-success" : "text-warning") :
                            d.actual >= d.target ? "text-success" : "text-warning"
                          )}>
                            {d.isTime ? `${d.actual}d` : `${d.actual}%`}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {d.isTime ? `${d.target}d target` : `${d.target}%`}</span>
                        </div>
                      </div>
                      <Progress
                        value={d.isTime ? Math.max(0, Math.min(100, ((d.target - d.actual + d.target) / (d.target * 2)) * 100)) : (d.actual / d.target) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Operational Risk Alerts
                </CardTitle>
                <CardDescription>{riskAlerts.length} active alerts detected</CardDescription>
              </CardHeader>
              <CardContent>
                {riskAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {riskAlerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <AlertTriangle className={cn("h-4 w-4 mt-0.5 flex-shrink-0",
                          alert.severity === "critical" ? "text-destructive" :
                          alert.severity === "high" ? "text-warning" : "text-info"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold">{alert.type}</span>
                            <SeverityBadge severity={alert.severity} />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{alert.item}</p>
                          <p className="text-xs text-muted-foreground">{alert.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    No active risk alerts — all systems normal
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Clients from real data */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Top Clients by Revenue</CardTitle>
                <CardDescription>Based on paid invoices</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExportCSV(clientData?.clientRows || [], "top-clients")}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(clientData?.clientRows || []).slice(0, 10).map((c, i) => (
                    <TableRow key={c.id} className="data-row">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="font-medium text-sm">{c.client}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">{fmt(c.revenue, true)}</TableCell>
                      <TableCell className="text-right text-sm">{c.shipments}</TableCell>
                      <TableCell className={cn("text-right text-sm font-medium", c.outstanding > 0 ? "text-warning" : "text-success")}>
                        {c.outstanding > 0 ? fmt(c.outstanding, true) : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={cn("status-badge", c.status === "active" ? "status-success" : "status-pending")}>
                          {c.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!clientData?.clientRows || clientData.clientRows.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No client data available</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: OPERATIONS ═══ */}
        <TabsContent value="operations" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-9" placeholder="Search BL, AWB, customer…" value={searchOps} onChange={e => setSearchOps(e.target.value)} />
                </div>
                <Select value={shipmentType} onValueChange={(v) => setShipmentType(v as ShipmentType)}>
                  <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sea">Sea Freight</SelectItem>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleExportCSV(filteredOps, "operations-report")} className="gap-1.5 ml-auto">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Consignments", value: opsStats?.total || 0, icon: Package, color: "text-primary" },
              { label: "Delivered", value: opsStats?.delivered || 0, icon: CheckCircle, color: "text-success" },
              { label: "In Progress", value: opsStats?.inProgress || 0, icon: Clock, color: "text-warning" },
              { label: "Delayed", value: opsStats?.delayed || 0, icon: AlertTriangle, color: "text-destructive" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Volume Chart */}
          {opsStats?.volumeByMonth && opsStats.volumeByMonth.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Consignment Volume by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={opsStats.volumeByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sea" fill="hsl(210,100%,40%)" name="Sea" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="air" fill="hsl(160,84%,39%)" name="Air" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="road" fill="hsl(38,92%,50%)" name="Road" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tracking Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">BL / AWB Tracking Summary</CardTitle>
              <CardDescription>{filteredOps.length} consignments matching filters</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BL / AWB</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origin → Destination</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Clearance</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Officer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOps.slice(0, 50).map((r) => (
                    <TableRow key={r.bl} className="data-row">
                      <TableCell className="font-mono text-xs text-primary">{r.bl}</TableCell>
                      <TableCell className="text-sm font-medium">{r.customer}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {r.type === "Sea" ? <Ship className="h-3.5 w-3.5 text-primary" /> :
                           r.type === "Air" ? <Plane className="h-3.5 w-3.5 text-info" /> :
                           <Truck className="h-3.5 w-3.5 text-warning" />}
                          <span className="text-xs">{r.type}</span>
                        </div>
                      </TableCell>
                      <TableCell><ShipmentStatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.origin} → {r.destination}</TableCell>
                      <TableCell className="text-xs">{r.eta}</TableCell>
                      <TableCell className="text-xs">{r.clearance}</TableCell>
                      <TableCell className="text-center">
                        {r.daysToClose !== null ? (
                          <span className={cn("text-xs font-medium", r.daysToClose <= 5 ? "text-success" : "text-warning")}>
                            {r.daysToClose}d
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{r.officer}</TableCell>
                    </TableRow>
                  ))}
                  {filteredOps.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No consignments found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: FINANCE ═══ */}
        <TabsContent value="finance" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue (Paid)", value: financeSummary?.totalRevenue || 0, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
              { label: "Outstanding Receivables", value: financeSummary?.totalOutstanding || 0, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
              { label: "Pending Payables", value: financeSummary?.totalPayables || 0, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Net Cash Position", value: financeSummary?.netCashPosition || 0, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            ].map(k => (
              <Card key={k.label} className="metric-card">
                <CardContent className="p-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-3", k.bg)}>
                    <k.icon className={cn("h-4 w-4", k.color)} />
                  </div>
                  <p className="text-lg font-bold">{fmt(k.value, true)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue chart */}
          {monthlyData && monthlyData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Revenue Report (6 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(210,100%,40%)" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(0,84%,60%)" name="Expenses" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="hsl(160,84%,39%)" name="Net Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Aging Buckets */}
          {financeSummary?.agingBuckets && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Receivables Aging</CardTitle>
                <CardDescription>Outstanding amounts by aging bucket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(financeSummary.agingBuckets).map(([bucket, data]) => {
                    const labels: Record<string, string> = {
                      current: "Current", "30_days": "30 Days", "60_days": "60 Days",
                      "90_days": "90 Days", "over_90": "Over 90",
                    };
                    const colors: Record<string, string> = {
                      current: "text-success", "30_days": "text-info", "60_days": "text-warning",
                      "90_days": "text-destructive", "over_90": "text-destructive",
                    };
                    return (
                      <div key={bucket} className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{labels[bucket] || bucket}</p>
                        <p className={cn("text-lg font-bold", colors[bucket])}>{data.count}</p>
                        <p className="text-xs text-muted-foreground">{fmt(data.amount, true)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Invoice Report</CardTitle>
                <CardDescription>All invoices from the system</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExportCSV(invoices.map(i => ({ invoice: i.invoiceNumber, customer: i.customer, amount: i.totalAmount, status: i.status, dueDate: i.dueDate })), "invoices")} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 30).map((inv) => (
                    <TableRow key={inv.id} className="data-row">
                      <TableCell className="font-mono text-xs text-primary">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{inv.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{inv.description}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">{fmt(inv.totalAmount)}</TableCell>
                      <TableCell>
                        <span className={cn("status-badge",
                          inv.status === "paid" ? "status-success" :
                          inv.status === "overdue" ? "status-danger" :
                          inv.status === "sent" ? "status-info" : "status-pending"
                        )}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{inv.dueDate}</TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: WAREHOUSE ═══ */}
        <TabsContent value="warehouse" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Consignments", value: opsStats?.total || 0, icon: Package, color: "text-primary" },
              { label: "At Port / Customs", value: (opsStats?.statusCounts?.["At Port"] || 0) + (opsStats?.statusCounts?.["Customs"] || 0), icon: Warehouse, color: "text-warning" },
              { label: "In Transit", value: opsStats?.statusCounts?.["In Transit"] || 0, icon: Truck, color: "text-info" },
              { label: "Delivered", value: opsStats?.delivered || 0, icon: CheckCircle, color: "text-success" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trucking Stats */}
          {truckingStats && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Trucking & Delivery Performance</CardTitle>
                <CardDescription>Trip completion and cost summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                    <p className="text-2xl font-bold text-foreground">{truckingStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                    <p className="text-2xl font-bold text-success">{truckingStats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                    <p className="text-2xl font-bold text-warning">{truckingStats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                    <p className="text-2xl font-bold text-primary">{truckingStats.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ TAB: CLIENTS ═══ */}
        <TabsContent value="clients" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Clients", value: clientData?.activeCount || 0, icon: Users, color: "text-success" },
              { label: "Total Clients", value: clientData?.totalCount || 0, icon: Users, color: "text-primary" },
              { label: "Total Outstanding", value: fmt(clientData?.totalOutstanding || 0, true), icon: AlertTriangle, color: "text-warning" },
              { label: "Avg Shipments/Client", value: clientData?.avgShipments || 0, icon: Package, color: "text-info" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search clients…" value={searchClient} onChange={e => setSearchClient(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(filteredClients, "client-profitability")} className="gap-1.5 ml-auto">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Client Profitability Report</CardTitle>
              <CardDescription>Revenue, shipments, and credit exposure per client</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Credit Limit</TableHead>
                    <TableHead>Exposure</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((c, i) => {
                    const exposure = c.creditLimit > 0 ? Math.round((c.outstanding / c.creditLimit) * 100) : 0;
                    return (
                      <TableRow key={c.id} className="data-row">
                        <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{c.client}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">{fmt(c.revenue, true)}</TableCell>
                        <TableCell className="text-right text-sm">{c.shipments}</TableCell>
                        <TableCell className={cn("text-right text-sm font-medium", c.outstanding > 0 ? "text-warning" : "text-muted-foreground")}>
                          {c.outstanding > 0 ? fmt(c.outstanding, true) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{c.creditLimit > 0 ? fmt(c.creditLimit, true) : "—"}</TableCell>
                        <TableCell>
                          {exposure > 0 && (
                            <div className="flex items-center gap-2">
                              <Progress value={exposure} className="h-1.5 w-16" />
                              <span className={cn("text-xs font-medium", exposure > 50 ? "text-warning" : "text-muted-foreground")}>
                                {exposure}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={cn("status-badge", c.status === "active" ? "status-success" : "status-pending")}>
                            {c.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No clients found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
