import {
  Package,
  Ship,
  Plane,
  Truck,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IntegrationStatusCard } from "@/components/dashboard/IntegrationStatusCard";
import { ShipmentStatusChart } from "@/components/dashboard/ShipmentStatusChart";
import { RecentShipmentsTable } from "@/components/dashboard/RecentShipmentsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ClearanceStatusWidget } from "@/components/dashboard/ClearanceStatusWidget";
import { useAuth } from "@/contexts/AuthContext";

const integrations = [
  { name: "ICUMS (Ghana Customs)", status: "connected" as const, lastSync: "2 min ago", details: "Real-time sync active" },
  { name: "GPHA Port Systems", status: "connected" as const, lastSync: "5 min ago", details: "Tema & Takoradi ports" },
  { name: "ODeX Shipping Portal", status: "pending" as const, lastSync: "Syncing...", details: "Processing 3 DOs" },
  { name: "Maersk Line", status: "connected" as const, lastSync: "1 min ago", details: "Container tracking active" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {firstName}. Here's your operations overview for today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Shipments"
          value={175}
          change={12}
          changeLabel="vs last week"
          icon={<Package className="h-5 w-5" />}
          variant="accent"
        />
        <MetricCard
          title="At Port / Customs"
          value={46}
          change={-5}
          changeLabel="vs yesterday"
          icon={<Ship className="h-5 w-5" />}
          variant="warning"
        />
        <MetricCard
          title="Pending Clearance"
          value={18}
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          title="Revenue (MTD)"
          value="GH₵ 2.4M"
          change={8}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="rounded-lg bg-info/10 p-2.5">
            <Plane className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">23</p>
            <p className="text-xs text-muted-foreground">Air Shipments</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Ship className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">142</p>
            <p className="text-xs text-muted-foreground">Sea Freight</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="rounded-lg bg-success/10 p-2.5">
            <Truck className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">10</p>
            <p className="text-xs text-muted-foreground">Road Transport</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="rounded-lg bg-destructive/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">4</p>
            <p className="text-xs text-muted-foreground">Alerts</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 cols wide */}
        <div className="lg:col-span-2 space-y-6">
          <RecentShipmentsTable />
          <div className="grid gap-6 md:grid-cols-2">
            <ShipmentStatusChart />
            <IntegrationStatusCard integrations={integrations} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <ClearanceStatusWidget />
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}
