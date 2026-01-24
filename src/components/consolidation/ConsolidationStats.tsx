import { Package, Ship, Plane, Clock, DollarSign, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsolidationStatsProps {
  totalConsolidations: number;
  activeConsolidations: number;
  pendingCustoms: number;
  totalRevenue: number;
  avgTurnaround: number;
  demurrageCharges: number;
  onTimeRate: number;
  totalCBM: number;
}

export function ConsolidationStats({
  totalConsolidations,
  activeConsolidations,
  pendingCustoms,
  totalRevenue,
  avgTurnaround,
  demurrageCharges,
  onTimeRate,
  totalCBM,
}: ConsolidationStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Active Consolidations",
      value: activeConsolidations,
      icon: Package,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Pending Customs",
      value: pendingCustoms,
      icon: Clock,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Revenue (MTD)",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg Turnaround",
      value: `${avgTurnaround} days`,
      icon: TrendingUp,
      iconColor: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "On-Time Delivery",
      value: `${onTimeRate}%`,
      icon: CheckCircle2,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Demurrage Charges",
      value: formatCurrency(demurrageCharges),
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Total CBM Handled",
      value: `${totalCBM.toLocaleString()} m³`,
      icon: Ship,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Consolidations",
      value: totalConsolidations,
      icon: Plane,
      iconColor: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn("rounded-lg p-2.5", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
