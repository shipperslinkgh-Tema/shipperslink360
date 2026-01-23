import { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Building2, Phone, Mail } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const companyTypeLabels = {
  importer: "Importer",
  exporter: "Exporter",
  both: "Importer/Exporter",
  freight_forwarder: "Freight Forwarder",
};

export function CustomerTable({ customers, onViewCustomer }: CustomerTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>TIN Number</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Shipments</TableHead>
          <TableHead>Outstanding</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{customer.companyName}</p>
                  {customer.tradeName && (
                    <p className="text-xs text-muted-foreground">({customer.tradeName})</p>
                  )}
                  <p className="text-xs text-muted-foreground">{customer.city}, {customer.country}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-sm">{customer.tinNumber}</span>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate max-w-[150px]">{customer.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{customer.phone}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                {companyTypeLabels[customer.companyType]}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="font-medium">{customer.totalShipments}</span>
            </TableCell>
            <TableCell>
              <span className={customer.outstandingBalance > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                {formatCurrency(customer.outstandingBalance)}
              </span>
            </TableCell>
            <TableCell>
              <Badge className={statusColors[customer.status]}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewCustomer(customer)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
