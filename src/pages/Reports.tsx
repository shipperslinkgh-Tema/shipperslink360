import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Package, DollarSign, Users, Warehouse,
  FileText, Download, Filter, Calendar, RefreshCw, AlertTriangle,
  CheckCircle, Clock, Ship, Plane, Truck, Target, Activity, PieChart,
  ArrowUpRight, ArrowDownRight, Eye, Search, ChevronDown, Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { invoices, payables } from "@/data/financeData";
import { customers } from "@/data/customerData";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, compact = false) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency", currency: "GHS",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const monthlyRevenue = [
  { month: "Aug", revenue: 285000, expenses: 198000, profit: 87000 },
  { month: "Sep", revenue: 312000, expenses: 210000, profit: 102000 },
  { month: "Oct", revenue: 298000, expenses: 205000, profit: 93000 },
  { month: "Nov", revenue: 340000, expenses: 225000, profit: 115000 },
  { month: "Dec", revenue: 420000, expenses: 270000, profit: 150000 },
  { month: "Jan", revenue: 378000, expenses: 248000, profit: 130000 },
];

const shipmentsByStatus = [
  { name: "In Transit", value: 34, color: "hsl(var(--primary))" },
  { name: "At Port", value: 18, color: "hsl(var(--warning))" },
  { name: "Customs", value: 12, color: "hsl(38 92% 60%)" },
  { name: "Delivered", value: 67, color: "hsl(var(--success))" },
  { name: "Pending", value: 9, color: "hsl(var(--muted-foreground))" },
];

const shipmentsByType = [
  { month: "Aug", sea: 45, air: 18, road: 12 },
  { month: "Sep", sea: 52, air: 21, road: 15 },
  { month: "Oct", sea: 48, air: 19, road: 11 },
  { month: "Nov", sea: 60, air: 25, road: 18 },
  { month: "Dec", sea: 72, air: 30, road: 20 },
  { month: "Jan", sea: 65, air: 27, road: 16 },
];

const warehouseOccupancy = [
  { zone: "Zone A", capacity: 500, used: 420, percentage: 84 },
  { zone: "Zone B", capacity: 400, used: 290, percentage: 73 },
  { zone: "Zone C", capacity: 300, used: 145, percentage: 48 },
  { zone: "Zone D", capacity: 250, used: 230, percentage: 92 },
];

const cargoAging = [
  { range: "0–7 days", count: 48, cbm: 320, color: "hsl(var(--success))" },
  { range: "8–14 days", count: 22, cbm: 145, color: "hsl(var(--warning))" },
  { range: "15–30 days", count: 11, cbm: 72, color: "hsl(38 92% 60%)" },
  { range: "30+ days", count: 5, cbm: 38, color: "hsl(var(--destructive))" },
];

const topClients = [
  { client: "Ghana Cocoa Board", revenue: 850000, shipments: 156, outstanding: 45000, status: "active" },
  { client: "Nestle Ghana Ltd", revenue: 720000, shipments: 234, outstanding: 120000, status: "active" },
  { client: "MTN Ghana", revenue: 580000, shipments: 78, outstanding: 250000, status: "active" },
  { client: "Unilever Ghana", revenue: 450000, shipments: 189, outstanding: 85000, status: "active" },
  { client: "AngloGold Ashanti", revenue: 380000, shipments: 62, outstanding: 0, status: "active" },
  { client: "Kasapreko Ltd", revenue: 220000, shipments: 45, outstanding: 0, status: "inactive" },
  { client: "Accra Brewery", revenue: 190000, shipments: 38, outstanding: 32000, status: "active" },
  { client: "Scancom Ghana", revenue: 165000, shipments: 29, outstanding: 18000, status: "active" },
];

const operationsData = [
  { bl: "BL-HLCU123456789", customer: "Ghana Cocoa Board", type: "Sea", status: "Delivered", origin: "China", destination: "Tema", eta: "Jan 15, 2026", clearance: "Jan 18, 2026", daysToClose: 3, officer: "Kofi Mensah" },
  { bl: "BL-OOLU987654321", customer: "Nestle Ghana Ltd", type: "Sea", status: "Customs", origin: "Netherlands", destination: "Tema", eta: "Jan 20, 2026", clearance: "—", daysToClose: null, officer: "Kwame Asante" },
  { bl: "AWB-78901234", customer: "MTN Ghana", type: "Air", status: "In Transit", origin: "UAE", destination: "Kotoka", eta: "Jan 28, 2026", clearance: "—", daysToClose: null, officer: "Ama Serwaa" },
  { bl: "BL-MAEU456789", customer: "Unilever Ghana", type: "Sea", status: "At Port", origin: "Germany", destination: "Tema", eta: "Jan 22, 2026", clearance: "—", daysToClose: null, officer: "Kofi Mensah" },
  { bl: "AWB-56789012", customer: "AngloGold Ashanti", type: "Air", status: "Delivered", origin: "South Africa", destination: "Kotoka", eta: "Jan 10, 2026", clearance: "Jan 11, 2026", daysToClose: 1, officer: "Ama Serwaa" },
  { bl: "BL-MSCU234567", customer: "Accra Brewery", type: "Sea", status: "Pending", origin: "Belgium", destination: "Tema", eta: "Feb 05, 2026", clearance: "—", daysToClose: null, officer: "Kwame Asante" },
];

const kpiData = [
  { label: "Total Revenue (MTD)", value: 378000, prev: 340000, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", positive: true },
  { label: "Active Shipments", value: 140, prev: 128, icon: Package, color: "text-info", bg: "bg-info/10", positive: true },
  { label: "Clearance Speed", value: "2.4 days", prevLabel: "3.1 days prior", icon: Clock, color: "text-success", bg: "bg-success/10", positive: true },
  { label: "Warehouse Occupancy", value: "74%", prevLabel: "68% last month", icon: Warehouse, color: "text-warning", bg: "bg-warning/10", positive: false },
];

const departmentPerf = [
  { dept: "Operations", target: 95, actual: 88, kpi: "Shipments On-Time" },
  { dept: "Customs", target: 90, actual: 82, kpi: "Declarations Approved" },
  { dept: "Finance", target: 98, actual: 94, kpi: "Invoice Accuracy" },
  { dept: "Warehouse", target: 85, actual: 79, kpi: "Dispatch Efficiency" },
  { dept: "Trucking", target: 92, actual: 91, kpi: "Trip Completion" },
];

const riskAlerts = [
  { type: "Demurrage Risk", item: "BL-OOLU987654321", detail: "Free days expire Jan 28", severity: "critical" },
  { type: "Overdue Invoice", item: "SLAC-2026-0003", detail: "GHS 20,812 overdue 10 days", severity: "high" },
  { type: "Storage Overdue", item: "Zone D, Rack 4", detail: "Cargo aging 32 days", severity: "high" },
  { type: "Credit Limit", item: "MTN Ghana", detail: "25% of GHS 1M limit used", severity: "medium" },
  { type: "Delayed Shipment", item: "BL-MSCU234567", detail: "Vessel delayed 5 days", severity: "medium" },
];

type DateRange = "mtd" | "qtd" | "ytd" | "custom";
type ShipmentType = "all" | "sea" | "air" | "road";

// ── Sub-components ────────────────────────────────────────────────────────────
function KPICard({ label, value, prev, prevLabel, icon: Icon, color, bg, positive }: {
  label: string; value: number | string; prev?: number; prevLabel?: string;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string; positive: boolean;
}) {
  const isNum = typeof value === "number";
  const change = isNum && typeof prev === "number"
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
                <span className="text-muted-foreground">{prevLabel}</span>
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
    "At Port": "status-badge bg-purple-100 text-purple-700",
    "Pending": "status-badge status-pending",
  };
  return <span className={map[status] || "status-badge status-pending"}>{status}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Reports() {
  const { profile, department } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("mtd");
  const [shipmentType, setShipmentType] = useState<ShipmentType>("all");
  const [searchOps, setSearchOps] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [activeTab, setActiveTab] = useState("management");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
    toast.success("Reports refreshed");
  };

  const handleExport = (format: "csv" | "pdf" | "excel") => {
    toast.success(`Exporting report as ${format.toUpperCase()}…`, { description: "Your download will start shortly." });
  };

  const filteredOps = useMemo(() =>
    operationsData.filter(r => {
      const matchType = shipmentType === "all" || r.type.toLowerCase() === shipmentType;
      const matchSearch = !searchOps || r.bl.toLowerCase().includes(searchOps.toLowerCase()) || r.customer.toLowerCase().includes(searchOps.toLowerCase());
      return matchType && matchSearch;
    }), [shipmentType, searchOps]);

  const filteredClients = useMemo(() =>
    topClients.filter(c => !searchClient || c.client.toLowerCase().includes(searchClient.toLowerCase())),
    [searchClient]);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);
  const totalOutstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0);
  const totalPayables = payables.filter(p => p.status === "pending").reduce((s, p) => s + p.ghsEquivalent, 0);
  const activeCustomers = customers.filter(c => c.status === "active").length;

  // Department-based default tab
  const allowedTabs = useMemo(() => {
    if (!department || department === "super_admin" || department === "management") {
      return ["management", "operations", "finance", "warehouse", "clients"];
    }
    if (department === "accounts") return ["finance", "clients"];
    if (department === "operations" || department === "documentation") return ["operations"];
    if (department === "warehouse") return ["warehouse"];
    return ["operations"];
  }, [department]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time business intelligence · Shippers Link Agencies Co., Ltd
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Excel
            </Button>
            <Button size="sm" onClick={() => handleExport("pdf")} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((k) => (
          <KPICard key={k.label} {...k} />
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

        {/* ══════════════════════════════════════════════
            TAB: MANAGEMENT DASHBOARD
        ══════════════════════════════════════════════ */}
        <TabsContent value="management" className="space-y-6 mt-6">
          {/* Revenue Trend + Shipment Mix */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Revenue vs Expenses (6 months)</CardTitle>
                <CardDescription>Monthly P&L trend in GHS</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyRevenue}>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Shipments by Status</CardTitle>
                <CardDescription>Current distribution</CardDescription>
              </CardHeader>
              <CardContent>
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
                <CardDescription>KPI achievement vs targets</CardDescription>
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
                          <span className={cn("text-sm font-bold", d.actual >= d.target ? "text-success" : "text-warning")}>
                            {d.actual}%
                          </span>
                          <span className="text-xs text-muted-foreground">/ {d.target}%</span>
                        </div>
                      </div>
                      <Progress
                        value={(d.actual / d.target) * 100}
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
                <CardDescription>{riskAlerts.length} active alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Top Clients Summary */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Top 10 Clients by Revenue</CardTitle>
                <CardDescription>MTD performance and outstanding balances</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("csv")}>
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
                  {topClients.slice(0, 8).map((c, i) => (
                    <TableRow key={c.client} className="data-row">
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* AI Executive Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Executive Summary
              </CardTitle>
              <CardDescription>Auto-generated insights powered by Lovable AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-foreground">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <p><strong>Revenue trending up 11.2%</strong> MTD vs prior period, driven by increased air freight volumes from MTN Ghana and AngloGold Ashanti contracts.</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <p><strong>Zone D at 92% capacity</strong> — projected to hit full occupancy by Feb 3. Recommend activating overflow Zone E or accelerating dispatches for aged cargo.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                  <p><strong>Clearance turnaround improved</strong> to 2.4 days avg (from 3.1 days). ICUMS e-filing adoption is the key driver — target 100% digital submissions by Q1 end.</p>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p><strong>GHS 375,812 in outstanding receivables</strong> with Unilever Ghana (10 days overdue) flagged as highest risk. Recommend immediate follow-up before Feb 1.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <Brain className="h-3.5 w-3.5" /> Open Full AI Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB: OPERATIONS REPORTS
        ══════════════════════════════════════════════ */}
        <TabsContent value="operations" className="space-y-6 mt-6">
          {/* Filters */}
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
                <Select defaultValue="all">
                  <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1.5 ml-auto">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Shipments", value: 140, icon: Package, color: "text-primary" },
              { label: "Delivered", value: 67, icon: CheckCircle, color: "text-success" },
              { label: "In Progress", value: 64, icon: Clock, color: "text-warning" },
              { label: "Delayed", value: 9, icon: AlertTriangle, color: "text-destructive" },
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

          {/* Shipment Volume Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Shipment Volume by Type (6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={shipmentsByType}>
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

          {/* BL Tracking Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">BL / AWB Tracking Summary</CardTitle>
              <CardDescription>{filteredOps.length} shipments matching filters</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {filteredOps.map((r) => (
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
                          <span className={cn("text-xs font-medium", r.daysToClose <= 2 ? "text-success" : "text-warning")}>
                            {r.daysToClose}d
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{r.officer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB: FINANCE REPORTS
        ══════════════════════════════════════════════ */}
        <TabsContent value="finance" className="space-y-6 mt-6">
          {/* Finance KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue (Paid)", value: totalRevenue, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
              { label: "Outstanding Receivables", value: totalOutstanding, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
              { label: "Pending Payables", value: totalPayables, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Net Cash Position", value: totalRevenue - totalPayables, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Revenue Report (6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRevenue}>
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

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Outstanding Invoices Report</CardTitle>
                <CardDescription>Unpaid and overdue invoices</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Issue Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
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
                      <TableCell className="text-xs">{inv.issueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB: WAREHOUSE REPORTS
        ══════════════════════════════════════════════ */}
        <TabsContent value="warehouse" className="space-y-6 mt-6">
          {/* Warehouse KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Cargo Items", value: "86", icon: Package, color: "text-primary" },
              { label: "Avg Occupancy", value: "74%", icon: Warehouse, color: "text-warning" },
              { label: "Inbound (MTD)", value: "142", icon: TrendingUp, color: "text-success" },
              { label: "Outbound (MTD)", value: "128", icon: TrendingDown, color: "text-info" },
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Zone Utilization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Space Utilization by Zone</CardTitle>
                <CardDescription>Current capacity usage (CBM)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {warehouseOccupancy.map((zone) => (
                    <div key={zone.zone}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-semibold">{zone.zone}</span>
                          <span className="text-xs text-muted-foreground ml-2">{zone.used} / {zone.capacity} CBM</span>
                        </div>
                        <span className={cn("text-sm font-bold",
                          zone.percentage >= 90 ? "text-destructive" :
                          zone.percentage >= 75 ? "text-warning" : "text-success"
                        )}>
                          {zone.percentage}%
                        </span>
                      </div>
                      <Progress value={zone.percentage} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cargo Aging */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Cargo Aging Report</CardTitle>
                <CardDescription>Number of cargo items by dwell time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={cargoAging} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="range" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Cargo Items" radius={[0, 4, 4, 0]}>
                      {cargoAging.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {cargoAging.map((c) => (
                    <div key={c.range} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-medium">{c.range}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span><strong className="text-foreground">{c.count}</strong> items</span>
                        <span><strong className="text-foreground">{c.cbm}</strong> CBM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB: CLIENT REPORTS
        ══════════════════════════════════════════════ */}
        <TabsContent value="clients" className="space-y-6 mt-6">
          {/* Client KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Clients", value: activeCustomers, icon: Users, color: "text-success" },
              { label: "Total Clients", value: customers.length, icon: Users, color: "text-primary" },
              { label: "Total Outstanding", value: fmt(customers.reduce((s, c) => s + c.outstandingBalance, 0), true), icon: AlertTriangle, color: "text-warning" },
              { label: "Avg Shipments/Client", value: Math.round(customers.reduce((s, c) => s + c.totalShipments, 0) / customers.length), icon: Package, color: "text-info" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-xl font-bold">{typeof s.value === "number" ? s.value : s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search clients…" value={searchClient} onChange={e => setSearchClient(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1.5 ml-auto">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>

          {/* Client Profitability Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Client Profitability Report</CardTitle>
              <CardDescription>Revenue, shipments, and credit exposure per client</CardDescription>
            </CardHeader>
            <CardContent>
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
                    const cust = customers.find(cu => cu.companyName === c.client);
                    const limit = cust?.creditLimit ?? 0;
                    const exposure = limit > 0 ? Math.round((c.outstanding / limit) * 100) : 0;
                    return (
                      <TableRow key={c.client} className="data-row">
                        <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{c.client}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">{fmt(c.revenue, true)}</TableCell>
                        <TableCell className="text-right text-sm">{c.shipments}</TableCell>
                        <TableCell className={cn("text-right text-sm font-medium", c.outstanding > 0 ? "text-warning" : "text-muted-foreground")}>
                          {c.outstanding > 0 ? fmt(c.outstanding, true) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{limit > 0 ? fmt(limit, true) : "—"}</TableCell>
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
