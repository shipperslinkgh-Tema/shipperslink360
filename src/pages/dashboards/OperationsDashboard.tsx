import { Package, Ship, Clock, AlertTriangle, Truck, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";
import { DepartmentMetricCard } from "@/components/dashboard/DepartmentMetricCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

export default function OperationsDashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {firstName}. Today's operational priorities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentMetricCard title="Active Shipments" value={stats.activeShipments} icon={<Package className="h-5 w-5" />} variant="info" />
        <DepartmentMetricCard title="Pending Clearance" value={stats.pendingClearance} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <DepartmentMetricCard title="Customs Declared" value={stats.customsDeclared} icon={<FileCheck className="h-5 w-5" />} variant="success" />
        <DepartmentMetricCard title="Pending Docs" value={stats.pendingDocs} icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => navigate("/consignments")}><Package className="h-4 w-4 mr-2" />Consignments</Button>
            <Button variant="outline" onClick={() => navigate("/shipments")}><Ship className="h-4 w-4 mr-2" />Shipments</Button>
            <Button variant="outline" onClick={() => navigate("/port-command")}><AlertTriangle className="h-4 w-4 mr-2" />Port Command</Button>
            <Button variant="outline" onClick={() => navigate("/customs/icums")}><FileCheck className="h-4 w-4 mr-2" />ICUMS</Button>
            <Button variant="outline" onClick={() => navigate("/trucking")}><Truck className="h-4 w-4 mr-2" />Trucking</Button>
            <Button variant="outline" onClick={() => navigate("/live-tracking")}><Truck className="h-4 w-4 mr-2" />Live Tracking</Button>
          </div>
        </Card>
        <AlertsPanel />
      </div>
    </div>
  );
}
