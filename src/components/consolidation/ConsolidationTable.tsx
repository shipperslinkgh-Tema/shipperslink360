import { useState } from "react";
import { Ship, Plane, MoreHorizontal, Eye, FileText, Truck, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Consolidation } from "@/types/consolidation";

interface ConsolidationTableProps {
  consolidations: Consolidation[];
  onSelect: (consolidation: Consolidation) => void;
}

const getTypeIcon = (type: Consolidation["type"]) => {
  switch (type) {
    case "LCL":
      return <Ship className="h-4 w-4 text-accent" />;
    case "AIR":
      return <Plane className="h-4 w-4 text-info" />;
  }
};

const getStatusBadge = (status: Consolidation["status"]) => {
  const styles: Record<Consolidation["status"], string> = {
    planning: "bg-muted text-muted-foreground",
    receiving: "bg-info/10 text-info border-info/20",
    stuffing: "bg-accent/10 text-accent border-accent/20",
    customs: "bg-warning/10 text-warning border-warning/20",
    "in-transit": "bg-info/10 text-info border-info/20",
    arrived: "bg-success/10 text-success border-success/20",
    delivered: "bg-success/10 text-success border-success/20",
    closed: "bg-muted text-muted-foreground",
  };

  const labels: Record<Consolidation["status"], string> = {
    planning: "Planning",
    receiving: "Receiving",
    stuffing: "Stuffing",
    customs: "At Customs",
    "in-transit": "In Transit",
    arrived: "Arrived",
    delivered: "Delivered",
    closed: "Closed",
  };

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", styles[status])}>
      {labels[status]}
    </Badge>
  );
};

export function ConsolidationTable({ consolidations, onSelect }: ConsolidationTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Consolidation Ref</TableHead>
            <TableHead>Master BL/AWB</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead className="text-center">Shippers</TableHead>
            <TableHead className="text-right">CBM</TableHead>
            <TableHead className="text-right">Weight</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consolidations.map((consolidation) => (
            <TableRow
              key={consolidation.id}
              className="cursor-pointer"
              onClick={() => onSelect(consolidation)}
            >
              <TableCell>{getTypeIcon(consolidation.type)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{consolidation.consolidationRef}</span>
                  {consolidation.containerNumber && (
                    <Badge variant="outline" className="text-[10px] bg-muted/50">
                      {consolidation.containerNumber}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {consolidation.masterBLNumber || consolidation.masterAWBNumber || "-"}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="text-muted-foreground">{consolidation.origin}</p>
                  <p className="font-medium text-foreground">→ {consolidation.destination}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{consolidation.carrier}</p>
                  <p className="text-xs text-muted-foreground">
                    {consolidation.vessel || consolidation.flight}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {consolidation.shippersCount}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {consolidation.totalCBM.toFixed(1)} m³
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {consolidation.totalWeight.toLocaleString()} kg
              </TableCell>
              <TableCell>
                <span className="text-sm">{new Date(consolidation.eta).toLocaleDateString()}</span>
              </TableCell>
              <TableCell>{getStatusBadge(consolidation.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onSelect(consolidation)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      View Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      Manage Shippers
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Truck className="mr-2 h-4 w-4" />
                      Schedule Delivery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
