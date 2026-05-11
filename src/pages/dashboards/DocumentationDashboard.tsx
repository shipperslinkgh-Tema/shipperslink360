import { FileText, Upload, FileCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";
import { DepartmentMetricCard } from "@/components/dashboard/DepartmentMetricCard";

export default function DocumentationDashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentation Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {firstName}. Documents requiring your attention.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentMetricCard title="Pending Documentation" value={stats.pendingDocs} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <DepartmentMetricCard title="Customs Declared" value={stats.customsDeclared} icon={<FileCheck className="h-5 w-5" />} variant="success" />
        <DepartmentMetricCard title="Active Shipments" value={stats.activeShipments} icon={<FileText className="h-5 w-5" />} variant="info" />
        <DepartmentMetricCard title="Pending Clearance" value={stats.pendingClearance} icon={<FileText className="h-5 w-5" />} variant="default" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => navigate("/consignments")}><FileText className="h-4 w-4 mr-2" />Consignments</Button>
          <Button variant="outline" onClick={() => navigate("/customs/icums")}><FileCheck className="h-4 w-4 mr-2" />ICUMS</Button>
          <Button variant="outline" onClick={() => navigate("/customs/gpha")}><FileCheck className="h-4 w-4 mr-2" />GPHA</Button>
          <Button variant="outline" onClick={() => navigate("/shipments")}><Upload className="h-4 w-4 mr-2" />Upload Docs</Button>
        </div>
      </Card>
    </div>
  );
}
