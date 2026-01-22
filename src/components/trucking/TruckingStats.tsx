import { Trip, Truck, Driver } from "@/types/trucking";
import { Card, CardContent } from "@/components/ui/card";
import { Truck as TruckIcon, Users, Route, DollarSign, Container, CheckCircle2 } from "lucide-react";

interface TruckingStatsProps {
  trucks: Truck[];
  drivers: Driver[];
  trips: Trip[];
}

export function TruckingStats({ trucks, drivers, trips }: TruckingStatsProps) {
  const availableTrucks = trucks.filter((t) => t.status === "available").length;
  const availableDrivers = drivers.filter((d) => d.status === "available").length;
  const activeTrips = trips.filter((t) => t.status === "in-transit").length;
  const pendingReturns = trips.filter((t) => !t.containerReturned && t.status !== "scheduled").length;
  const totalRevenue = trips.reduce((sum, t) => sum + t.tripCost, 0);
  const totalDriverPayments = trips.reduce((sum, t) => sum + t.driverPayment, 0);

  const stats = [
    {
      label: "Available Trucks",
      value: `${availableTrucks}/${trucks.length}`,
      icon: TruckIcon,
      color: "text-status-success",
      bgColor: "bg-status-success/10",
    },
    {
      label: "Available Drivers",
      value: `${availableDrivers}/${drivers.length}`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Trips",
      value: activeTrips.toString(),
      icon: Route,
      color: "text-status-warning",
      bgColor: "bg-status-warning/10",
    },
    {
      label: "Pending Returns",
      value: pendingReturns.toString(),
      icon: Container,
      color: "text-status-danger",
      bgColor: "bg-status-danger/10",
    },
    {
      label: "Total Revenue",
      value: `GHS ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-status-success",
      bgColor: "bg-status-success/10",
    },
    {
      label: "Driver Payments",
      value: `GHS ${totalDriverPayments.toLocaleString()}`,
      icon: CheckCircle2,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
