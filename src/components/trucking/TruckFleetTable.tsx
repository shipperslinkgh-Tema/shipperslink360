import { Truck } from "@/types/trucking";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck as TruckIcon, Wrench, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface TruckFleetTableProps {
  trucks: Truck[];
}

const statusConfig = {
  available: { label: "Available", className: "status-success" },
  "on-trip": { label: "On Trip", className: "status-warning" },
  maintenance: { label: "Maintenance", className: "status-danger" },
};

const typeLabels = {
  flatbed: "Flatbed",
  container: "Container",
  tanker: "Tanker",
  lowbed: "Lowbed",
};

export function TruckFleetTable({ trucks }: TruckFleetTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Truck Fleet</h3>
        </div>
        <Badge variant="outline">{trucks.length} Trucks</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg. Number</TableHead>
            <TableHead>Make / Model</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trucks.map((truck) => {
            const status = statusConfig[truck.status];
            return (
              <TableRow key={truck.id}>
                <TableCell className="font-medium">{truck.registrationNumber}</TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{truck.make}</span>
                    <span className="text-muted-foreground ml-1">{truck.model}</span>
                  </div>
                </TableCell>
                <TableCell>{typeLabels[truck.type]}</TableCell>
                <TableCell>{truck.capacity}</TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", status.className)}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
