import { useState, useEffect } from "react";
import { NewShipmentDialog } from "@/components/shipments/NewShipmentDialog";
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
  Loader2,
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
import { supabase } from "@/integrations/supabase/client";

interface Shipment {
  id: string;
  blNumber: string;
  customer: string;
  consignee: string;
  origin: string;
  destination: string;
  type: "sea" | "air" | "road";
  status: string;
  mode: string;
  eta: string;
  containers?: number;
  weight: string;
  icumsRef?: string;
}

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

const getStatusBadge = (status: string) => {
  return <span className="status-badge status-info">{status.replace(/_/g, " ")}</span>;
};

export default function Shipments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("consignment_workflows")
        .select("id, consignment_ref, bl_number, client_name, origin_country, port_of_discharge, shipment_type, current_stage, eta")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: Shipment[] = data.map((d: any) => {
          const t = (d.shipment_type || "").toLowerCase();
          const type: Shipment["type"] = t.includes("air") ? "air" : t.includes("road") || t.includes("truck") ? "road" : "sea";
          return {
            id: d.id,
            blNumber: d.bl_number || d.consignment_ref || "—",
            customer: d.client_name || "—",
            consignee: d.client_name || "—",
            origin: d.origin_country || "—",
            destination: d.port_of_discharge || "—",
            type,
            status: d.current_stage || "pending",
            mode: d.shipment_type || "—",
            eta: d.eta ? new Date(d.eta).toLocaleDateString() : "—",
            weight: "—",
          };
        });
        setShipments(mapped);
      }
      setLoading(false);
    };
    fetchShipments();
  }, []);

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
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setShowNewShipment(true)}>
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
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No shipments found</p>
              <Button
                className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setShowNewShipment(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Shipment
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">BL/AWB</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Route</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Mode</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ETA</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="data-row">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-medium text-foreground">{shipment.blNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-foreground">{shipment.customer}</span>
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
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(shipment.status)}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{shipment.eta}</span>
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
                          <DropdownMenuItem className="text-accent">Track in ICUMS</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredShipments.length > 0 && (
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
        )}
      </div>
      <NewShipmentDialog open={showNewShipment} onOpenChange={setShowNewShipment} />
    </div>
  );
}
