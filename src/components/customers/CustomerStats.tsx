import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, AlertCircle, DollarSign } from "lucide-react";

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  pendingDocuments: number;
  totalOutstanding: number;
}

export function CustomerStats({
  totalCustomers,
  activeCustomers,
  pendingDocuments,
  totalOutstanding,
}: CustomerStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Building2,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Customers",
      value: activeCustomers,
      icon: Users,
      iconColor: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Expiring Documents",
      value: pendingDocuments,
      icon: AlertCircle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Total Outstanding",
      value: formatCurrency(totalOutstanding),
      icon: DollarSign,
      iconColor: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
