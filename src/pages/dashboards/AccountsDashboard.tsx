import { DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartmentStats } from "@/hooks/useDepartmentStats";
import { DepartmentMetricCard } from "@/components/dashboard/DepartmentMetricCard";

const fmt = (n: number) => `GHS ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function AccountsDashboard() {
  const { profile } = useAuth();
  const stats = useDepartmentStats();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const netMargin = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accounts Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {firstName}. Financial overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentMetricCard title="Total Revenue" value={fmt(stats.totalRevenue)} icon={<TrendingUp className="h-5 w-5" />} variant="success" />
        <DepartmentMetricCard title="Total Expenses" value={fmt(stats.totalExpenses)} icon={<TrendingDown className="h-5 w-5" />} variant="destructive" />
        <DepartmentMetricCard title="Net Margin" value={fmt(netMargin)} icon={<DollarSign className="h-5 w-5" />} variant={netMargin >= 0 ? "success" : "destructive"} />
        <DepartmentMetricCard title="Outstanding" value={fmt(stats.outstanding)} icon={<AlertCircle className="h-5 w-5" />} variant="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DepartmentMetricCard title="Total Invoices" value={stats.invoicesTotal} icon={<FileText className="h-5 w-5" />} variant="info" />
        <DepartmentMetricCard title="Unpaid Invoices" value={stats.invoicesUnpaid} icon={<CreditCard className="h-5 w-5" />} variant="warning" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => navigate("/finance")}><DollarSign className="h-4 w-4 mr-2" />Finance</Button>
          <Button variant="outline" onClick={() => navigate("/finance/invoices")}><FileText className="h-4 w-4 mr-2" />Invoices</Button>
          <Button variant="outline" onClick={() => navigate("/finance/payments")}><CreditCard className="h-4 w-4 mr-2" />Payments</Button>
          <Button variant="outline" onClick={() => navigate("/finance/reports")}><TrendingUp className="h-4 w-4 mr-2" />Reports</Button>
        </div>
      </Card>
    </div>
  );
}
