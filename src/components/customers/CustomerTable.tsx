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
import { Eye, Building2, Phone, Mail, User } from "lucide-react";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer ID</TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Warehouse(s)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              <span className="font-mono text-sm text-primary">
                {customer.customerCode || "—"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{customer.companyName}</p>
                  {customer.tinNumber && (
                    <p className="text-xs text-muted-foreground">TIN: {customer.tinNumber}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {customer.contactName ? (
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{customer.contactName}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {customer.phone && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">{customer.email}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                {companyTypeLabels[customer.companyType]}
              </Badge>
            </TableCell>
            <TableCell>
              {customer.warehouseDestinations?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {customer.warehouseDestinations.map((w) => (
                    <Badge key={w} variant="secondary" className="text-xs">
                      {w}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
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
