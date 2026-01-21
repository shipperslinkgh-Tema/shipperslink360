import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Ship,
  Plane,
  Truck,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Shipment {
  id: string;
  blNumber: string;
  customer: string;
  consignee: string;
  origin: string;
  destination: string;
  type: "sea" | "air" | "road";
  status: "in-transit" | "at-port" | "customs" | "delivered" | "pending";
  mode: "FCL" | "LCL" | "Air" | "Road";
  eta: string;
  containers?: number;
  weight: string;
  icumsRef?: string;
}

const shipments: Shipment[] = [
  {
    id: "SHP001",
    blNumber: "MSKU2345678",
    customer: "Gold Coast Trading Ltd",
    consignee: "Same as shipper",
    origin: "Shanghai, CN",
    destination: "Tema, GH",
    type: "sea",
    status: "at-port",
    mode: "FCL",
    eta: "Jan 22, 2026",
    containers: 2,
    weight: "24,500 KG",
    icumsRef: "C2026-00892",
  },
  {
    id: "SHP002",
    blNumber: "AWB-7890123",
    customer: "Accra Electronics",
    consignee: "Accra Electronics Ltd",
    origin: "Dubai, UAE",
    destination: "Kotoka Int'l",
    type: "air",
    status: "customs",
    mode: "Air",
    eta: "Jan 21, 2026",
    weight: "1,250 KG",
    icumsRef: "C2026-00895",
  },
  {
    id: "SHP003",
    blNumber: "COSU8901234",
    customer: "West Africa Motors",
    consignee: "W.A. Motors Ghana",
    origin: "Hamburg, DE",
    destination: "Tema, GH",
    type: "sea",
    status: "in-transit",
    mode: "FCL",
    eta: "Feb 05, 2026",
    containers: 4,
    weight: "78,200 KG",
  },
  {
    id: "SHP004",
    blNumber: "TRK-4567890",
    customer: "Kumasi Textiles",
    consignee: "Kumasi Textiles Co",
    origin: "Tema Port",
    destination: "Kumasi",
    type: "road",
    status: "delivered",
    mode: "Road",
    eta: "Jan 20, 2026",
    weight: "12,000 KG",
  },
  {
    id: "SHP005",
    blNumber: "HLCU5678901",
    customer: "Ghana Pharma Ltd",
    consignee: "Ghana Pharma Ltd",
    origin: "Mumbai, IN",
    destination: "Tema, GH",
    type: "sea",
    status: "pending",
    mode: "LCL",
    eta: "Feb 15, 2026",
    containers: 1,
    weight: "8,400 KG",
  },
  {
    id: "SHP006",
    blNumber: "OOLU7654321",
    customer: "Takoradi Steel",
    consignee: "Takoradi Steel Works",
    origin: "Rotterdam, NL",
    destination: "Takoradi, GH",
    type: "sea",
    status: "in-transit",
    mode: "FCL",
    eta: "Feb 10, 2026",
    containers: 6,
    weight: "156,000 KG",
  },
  {
    id: "SHP007",
    blNumber: "AWB-1234567",
    customer: "Cape Coast Imports",
    consignee: "CC Imports Ltd",
    origin: "London, UK",
    destination: "Kotoka Int'l",
    type: "air",
    status: "at-port",
    mode: "Air",
    eta: "Jan 23, 2026",
    weight: "890 KG",
    icumsRef: "C2026-00901",
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

export default function Shipments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    const matchesType = typeFilter === "all" || shipment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
          <p className="text-muted-foreground">Manage and track all your shipments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by BL number, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="at-port">At Port</SelectItem>
              <SelectItem value="customs">Customs</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sea">Sea Freight</SelectItem>
              <SelectItem value="air">Air Freight</SelectItem>
              <SelectItem value="road">Road Transport</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 whitespace-nowrap">
          <span className="text-sm font-medium text-foreground">{shipments.length}</span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-info/10 whitespace-nowrap">
          <span className="text-sm font-medium text-info">
            {shipments.filter((s) => s.status === "in-transit").length}
          </span>
          <span className="text-sm text-muted-foreground">In Transit</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 whitespace-nowrap">
          <span className="text-sm font-medium text-warning">
            {shipments.filter((s) => s.status === "at-port").length}
          </span>
          <span className="text-sm text-muted-foreground">At Port</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 whitespace-nowrap">
          <span className="text-sm font-medium text-success">
            {shipments.filter((s) => s.status === "delivered").length}
          </span>
          <span className="text-sm text-muted-foreground">Delivered</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                  Mode
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ETA
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ICUMS Ref
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="data-row">
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-mono text-sm font-medium text-foreground">
                        {shipment.blNumber}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">ID: {shipment.id}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-sm font-medium text-foreground">{shipment.customer}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{shipment.consignee}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{shipment.origin}</span>
                      <span className="mx-2 text-muted-foreground/50">→</span>
                      <span className="text-foreground">{shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{getTypeIcon(shipment.type)}</span>
                      <span className="text-sm text-foreground">{shipment.mode}</span>
                      {shipment.containers && (
                        <Badge variant="secondary" className="text-xs">
                          {shipment.containers}x
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(shipment.status)}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{shipment.eta}</span>
                  </td>
                  <td className="px-5 py-4">
                    {shipment.icumsRef ? (
                      <span className="font-mono text-xs text-accent">{shipment.icumsRef}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Shipment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-accent">
                          Track in ICUMS
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredShipments.length}</span> of{" "}
            <span className="font-medium text-foreground">{shipments.length}</span> shipments
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
