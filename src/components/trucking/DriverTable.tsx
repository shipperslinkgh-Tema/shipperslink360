import { Driver } from "@/types/trucking";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Phone, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriverTableProps {
  drivers: Driver[];
}

const statusConfig = {
  available: { label: "Available", className: "status-success" },
  "on-trip": { label: "On Trip", className: "status-warning" },
  "off-duty": { label: "Off Duty", className: "bg-muted text-muted-foreground" },
};

export function DriverTable({ drivers }: DriverTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Drivers</h3>
        </div>
        <Badge variant="outline">{drivers.length} Drivers</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>License No.</TableHead>
            <TableHead>License Expiry</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => {
            const status = statusConfig[driver.status];
            const isExpiringSoon = new Date(driver.licenseExpiry) < new Date("2026-06-01");
            return (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {driver.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    {driver.licenseNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(isExpiringSoon && "text-status-warning font-medium")}>
                    {driver.licenseExpiry}
                  </span>
                </TableCell>
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
