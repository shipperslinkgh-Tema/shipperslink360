import { Truck, Users, MapPin, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";
import { DepartmentMetricCard } from "@/components/dashboard/DepartmentMetricCard";

export default function FleetDashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fleet & Trucking Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {firstName}. Fleet operations at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentMetricCard title="Active Trips" value={stats.activeTrips} icon={<Truck className="h-5 w-5" />} variant="info" />
        <DepartmentMetricCard title="Available Drivers" value={stats.availableDrivers} icon={<Users className="h-5 w-5" />} variant="success" />
        <DepartmentMetricCard title="Total Trucks" value={stats.trucksTotal} icon={<Truck className="h-5 w-5" />} variant="default" />
        <DepartmentMetricCard title="Active Shipments" value={stats.activeShipments} icon={<Package className="h-5 w-5" />} variant="warning" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => navigate("/trucking")}><Truck className="h-4 w-4 mr-2" />Trucking</Button>
          <Button variant="outline" onClick={() => navigate("/live-tracking")}><MapPin className="h-4 w-4 mr-2" />Live Tracking</Button>
          <Button variant="outline" onClick={() => navigate("/warehouse")}><Package className="h-4 w-4 mr-2" />Warehouse</Button>
          <Button variant="outline" onClick={() => navigate("/consignments")}><Package className="h-4 w-4 mr-2" />Consignments</Button>
        </div>
      </Card>
    </div>
  );
}
