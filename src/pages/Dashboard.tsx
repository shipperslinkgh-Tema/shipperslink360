import { Package, Ship, Clock } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IntegrationStatusCard } from "@/components/dashboard/IntegrationStatusCard";
import { ShipmentStatusChart } from "@/components/dashboard/ShipmentStatusChart";
import { RecentShipmentsTable } from "@/components/dashboard/RecentShipmentsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ClearanceStatusWidget } from "@/components/dashboard/ClearanceStatusWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";

const integrations = [
  { name: "ICUMS (Ghana Customs)", status: "connected" as const, lastSync: "2 min ago", details: "Real-time sync active" },
  { name: "GPHA Port Systems", status: "connected" as const, lastSync: "5 min ago", details: "Tema & Takoradi ports" },
  { name: "ODeX Shipping Portal", status: "pending" as const, lastSync: "Syncing...", details: "Processing 3 DOs" },
  { name: "Maersk Line", status: "connected" as const, lastSync: "1 min ago", details: "Container tracking active" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Active Shipments"
          value={stats.activeShipments}
          icon={<Package className="h-5 w-5" />}
          variant="accent"
        />
        <MetricCard
          title="At Port / Customs"
          value={stats.pendingClearance}
          icon={<Ship className="h-5 w-5" />}
          variant="warning"
        />
        <MetricCard
          title="Pending Documentation"
          value={stats.pendingDocs}
          icon={<Clock className="h-5 w-5" />}
        />
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
