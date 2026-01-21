import { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DORecord {
  id: string;
  blNumber: string;
  containerNo: string;
  shippingLine: string;
  customer: string;
  doStatus: "released" | "pending_payment" | "pending_approval" | "blocked";
  freeDaysLeft: number;
  totalFreeDays: number;
  arrivalDate: string;
  doAmount: number;
}

const doRecords: DORecord[] = [
  {
    id: "1",
    blNumber: "MSKU2345678",
    containerNo: "MSKU1234567",
    shippingLine: "Maersk",
    customer: "Gold Coast Trading",
    doStatus: "released",
    freeDaysLeft: 5,
    totalFreeDays: 14,
    arrivalDate: "2024-01-15",
    doAmount: 850,
  },
  {
    id: "2",
    blNumber: "MSCU8901234",
    containerNo: "MSCU9876543",
    shippingLine: "MSC",
    customer: "Accra Electronics",
    doStatus: "pending_payment",
    freeDaysLeft: 2,
    totalFreeDays: 14,
    arrivalDate: "2024-01-12",
    doAmount: 920,
  },
  {
    id: "3",
    blNumber: "CMAU5678901",
    containerNo: "CMAU4567890",
    shippingLine: "CMA CGM",
    customer: "West Africa Motors",
    doStatus: "pending_approval",
    freeDaysLeft: 8,
    totalFreeDays: 14,
    arrivalDate: "2024-01-18",
    doAmount: 780,
  },
  {
    id: "4",
    blNumber: "HLCU3456789",
    containerNo: "HLCU2345678",
    shippingLine: "Hapag-Lloyd",
    customer: "Ghana Importers Ltd",
    doStatus: "blocked",
    freeDaysLeft: 0,
    totalFreeDays: 14,
    arrivalDate: "2024-01-05",
    doAmount: 1250,
  },
  {
    id: "5",
    blNumber: "COSU7890123",
    containerNo: "COSU6789012",
    shippingLine: "COSCO",
    customer: "Tema Distributors",
    doStatus: "released",
    freeDaysLeft: 10,
    totalFreeDays: 14,
    arrivalDate: "2024-01-20",
    doAmount: 680,
  },
];

const getStatusBadge = (status: DORecord["doStatus"]) => {
  switch (status) {
    case "released":
      return <span className="status-badge status-success">Released</span>;
    case "pending_payment":
      return <span className="status-badge status-warning">Pending Payment</span>;
    case "pending_approval":
      return <span className="status-badge status-info">Pending Approval</span>;
    case "blocked":
      return <span className="status-badge status-danger">Blocked</span>;
  }
};

const getFreeDaysIndicator = (left: number, total: number) => {
  const percentage = (left / total) * 100;
  let colorClass = "bg-success";
  if (percentage <= 20) colorClass = "bg-destructive";
  else if (percentage <= 50) colorClass = "bg-warning";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium",
        left <= 2 ? "text-destructive" : left <= 5 ? "text-warning" : "text-muted-foreground"
      )}>
        {left} days
      </span>
    </div>
  );
};

interface DOStatusTableProps {
  searchQuery: string;
  lineFilter: string;
}

export function DOStatusTable({ searchQuery, lineFilter }: DOStatusTableProps) {
  const filteredRecords = doRecords.filter((record) => {
    const matchesSearch = 
      record.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLine = 
      lineFilter === "all" || 
      record.shippingLine.toLowerCase().includes(lineFilter.toLowerCase());

    return matchesSearch && matchesLine;
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Delivery Order Status</h3>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BL / Container</TableHead>
              <TableHead>Shipping Line</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>DO Status</TableHead>
              <TableHead>Free Days Left</TableHead>
              <TableHead>DO Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {record.blNumber}
                    </span>
                    <p className="text-xs text-muted-foreground">{record.containerNo}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.shippingLine}</Badge>
                </TableCell>
                <TableCell className="text-sm">{record.customer}</TableCell>
                <TableCell>{getStatusBadge(record.doStatus)}</TableCell>
                <TableCell>
                  {getFreeDaysIndicator(record.freeDaysLeft, record.totalFreeDays)}
                </TableCell>
                <TableCell className="font-medium">
                  ${record.doAmount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Process Payment</DropdownMenuItem>
                      <DropdownMenuItem>Download DO</DropdownMenuItem>
                      <DropdownMenuItem>View on ODeX</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {doRecords.length} records
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
