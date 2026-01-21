import { Ship, Plane, Truck, ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Shipment {
  id: string;
  blNumber: string;
  customer: string;
  origin: string;
  destination: string;
  type: "sea" | "air" | "road";
  status: "in-transit" | "at-port" | "customs" | "delivered" | "pending";
  eta: string;
  containers?: number;
}

const shipments: Shipment[] = [
  {
    id: "SHP001",
    blNumber: "MSKU2345678",
    customer: "Gold Coast Trading Ltd",
    origin: "Shanghai, CN",
    destination: "Tema, GH",
    type: "sea",
    status: "at-port",
    eta: "Jan 22, 2026",
    containers: 2,
  },
  {
    id: "SHP002",
    blNumber: "AWB-7890123",
    customer: "Accra Electronics",
    origin: "Dubai, UAE",
    destination: "Kotoka Int'l",
    type: "air",
    status: "customs",
    eta: "Jan 21, 2026",
  },
  {
    id: "SHP003",
    blNumber: "COSU8901234",
    customer: "West Africa Motors",
    origin: "Hamburg, DE",
    destination: "Tema, GH",
    type: "sea",
    status: "in-transit",
    eta: "Feb 05, 2026",
    containers: 4,
  },
  {
    id: "SHP004",
    blNumber: "TRK-4567890",
    customer: "Kumasi Textiles",
    origin: "Tema Port",
    destination: "Kumasi",
    type: "road",
    status: "delivered",
    eta: "Jan 20, 2026",
  },
  {
    id: "SHP005",
    blNumber: "HLCU5678901",
    customer: "Ghana Pharma Ltd",
    origin: "Mumbai, IN",
    destination: "Tema, GH",
    type: "sea",
    status: "pending",
    eta: "Feb 15, 2026",
    containers: 1,
  },
];

const getTypeIcon = (type: Shipment["type"]) => {
  switch (type) {
    case "sea":
      return <Ship className="h-4 w-4" />;
    case "air":
      return <Plane className="h-4 w-4" />;
    case "road":
      return <Truck className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: Shipment["status"]) => {
  const styles = {
    "in-transit": "status-info",
    "at-port": "status-warning",
    customs: "status-pending",
    delivered: "status-success",
    pending: "status-pending",
  };

  const labels = {
    "in-transit": "In Transit",
    "at-port": "At Port",
    customs: "Customs",
    delivered: "Delivered",
    pending: "Pending",
  };

  return <span className={cn("status-badge", styles[status])}>{labels[status]}</span>;
};

export function RecentShipmentsTable() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Shipments</h3>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
          View All <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                BL/AWB
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Customer
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Route
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                ETA
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="data-row">
                <td className="px-5 py-4">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {shipment.blNumber}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-foreground">{shipment.customer}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{shipment.origin}</span>
                    <span className="mx-2 text-muted-foreground/50">→</span>
                    <span className="text-foreground">{shipment.destination}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {getTypeIcon(shipment.type)}
                    <span className="text-sm capitalize">{shipment.type}</span>
                    {shipment.containers && (
                      <Badge variant="secondary" className="text-xs">
                        {shipment.containers} CTR
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">{getStatusBadge(shipment.status)}</td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">{shipment.eta}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
