import { Users, UserPlus, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";
import { DepartmentMetricCard } from "@/components/dashboard/DepartmentMetricCard";

export default function MarketingDashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {firstName}. Customer growth and engagement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentMetricCard title="Total Customers" value={stats.totalCustomers} icon={<Users className="h-5 w-5" />} variant="info" />
        <DepartmentMetricCard title="New (30 days)" value={stats.newCustomers30d} icon={<UserPlus className="h-5 w-5" />} variant="success" />
        <DepartmentMetricCard title="Active Shipments" value={stats.activeShipments} icon={<TrendingUp className="h-5 w-5" />} variant="default" />
        <DepartmentMetricCard title="Conversion Rate" value={stats.totalCustomers ? `${Math.round((stats.newCustomers30d / stats.totalCustomers) * 100)}%` : "0%"} icon={<BarChart3 className="h-5 w-5" />} variant="warning" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => navigate("/customers")}><Users className="h-4 w-4 mr-2" />Customers</Button>
          <Button variant="outline" onClick={() => navigate("/reports")}><BarChart3 className="h-4 w-4 mr-2" />Reports</Button>
          <Button variant="outline" onClick={() => navigate("/customers")}><UserPlus className="h-4 w-4 mr-2" />Add Lead</Button>
        </div>
      </Card>
    </div>
  );
}
