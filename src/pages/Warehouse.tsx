import { useState } from "react";
import { 
  Warehouse, Package, Truck, AlertTriangle, CheckCircle, 
  Clock, Search, Plus, Filter, BarChart3, ArrowRight,
  MapPin, Scale, Calendar, User, FileText, RefreshCw,
  TrendingUp, Box, ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CargoStatus = "receiving" | "stored" | "tallied" | "loaded" | "dispatched" | "held";

interface CargoItem {
  id: string;
  ref: string;
  shipper: string;
  consignee: string;
  description: string;
  packages: number;
  weight: string;
  location: string;
  status: CargoStatus;
  receivedDate: string;
  receivedBy: string;
  consolidationRef?: string;
  blRef?: string;
}

interface WarehouseLocation {
  id: string;
  name: string;
  capacity: number;
  used: number;
  type: "bay" | "section" | "cold_store";
}

const mockCargo: CargoItem[] = [
  {
    id: "CRG001",
    ref: "CRG-2026-001",
    shipper: "Ghana Trading Co.",
    consignee: "Accra Supermart",
    description: "Electronic Components - Mixed",
    packages: 45,
    weight: "1,250 kg",
    location: "Bay A - Section 3",
    status: "stored",
    receivedDate: "2026-02-15",
    receivedBy: "Kwame Asante",
    consolidationRef: "SLAC-LCN-2026-001",
    blRef: "COSU123456789"
  },
  {
    id: "CRG002",
    ref: "CRG-2026-002",
    shipper: "Kumasi Imports Ltd.",
    consignee: "Gold Coast Retail",
    description: "Textile Fabrics - Cotton Bales",
    packages: 80,
    weight: "3,200 kg",
    location: "Bay B - Section 1",
    status: "tallied",
    receivedDate: "2026-02-14",
    receivedBy: "Ama Serwaa",
    consolidationRef: "SLAC-LCN-2026-001",
    blRef: "COSU123456789"
  },
  {
    id: "CRG003",
    ref: "CRG-2026-003",
    shipper: "Tema Industrial Corp",
    consignee: "Western Region Distributors",
    description: "Industrial Machinery Parts",
    packages: 12,
    weight: "8,400 kg",
    location: "Bay C - Heavy",
    status: "receiving",
    receivedDate: "2026-02-16",
    receivedBy: "Kofi Mensah",
    blRef: "MSCU987654321"
  },
  {
    id: "CRG004",
    ref: "CRG-2026-004",
    shipper: "Agri Imports Ghana",
    consignee: "Northern Agro Ltd",
    description: "Agricultural Equipment",
    packages: 6,
    weight: "2,100 kg",
    location: "Bay A - Section 1",
    status: "loaded",
    receivedDate: "2026-02-10",
    receivedBy: "Adjoa Mensah",
    consolidationRef: "SLAC-LCN-2026-002",
    blRef: "HLCU556677889"
  },
  {
    id: "CRG005",
    ref: "CRG-2026-005",
    shipper: "Cape Coast Beverages",
    consignee: "National Beverages Ltd",
    description: "Food & Beverages - Canned Goods",
    packages: 200,
    weight: "4,800 kg",
    location: "Quarantine Bay",
    status: "held",
    receivedDate: "2026-02-13",
    receivedBy: "Kwame Asante",
    blRef: "EVGU223344556"
  },
  {
    id: "CRG006",
    ref: "CRG-2026-006",
    shipper: "Accra Motors Import",
    consignee: "Vehicle Traders Assoc.",
    description: "Auto Parts - Spare Parts Kit",
    packages: 35,
    weight: "950 kg",
    location: "Bay D - Auto",
    status: "dispatched",
    receivedDate: "2026-02-08",
    receivedBy: "Ama Serwaa",
    blRef: "OOLU112233445"
  },
];

const warehouseLocations: WarehouseLocation[] = [
  { id: "L1", name: "Bay A", capacity: 500, used: 320, type: "bay" },
  { id: "L2", name: "Bay B", capacity: 600, used: 450, type: "bay" },
  { id: "L3", name: "Bay C - Heavy", capacity: 300, used: 120, type: "bay" },
  { id: "L4", name: "Bay D - Auto", capacity: 200, used: 85, type: "bay" },
  { id: "L5", name: "Quarantine Bay", capacity: 100, used: 40, type: "section" },
  { id: "L6", name: "Cold Store A", capacity: 80, used: 12, type: "cold_store" },
];

const statusConfig: Record<CargoStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  receiving: { label: "Receiving", color: "bg-info text-info-foreground", icon: Package },
  stored: { label: "Stored", color: "bg-success text-success-foreground", icon: CheckCircle },
  tallied: { label: "Tallied", color: "bg-accent text-accent-foreground", icon: ClipboardList },
  loaded: { label: "Loaded", color: "bg-warning text-warning-foreground", icon: Truck },
  dispatched: { label: "Dispatched", color: "bg-muted text-muted-foreground", icon: ArrowRight },
  held: { label: "Held / Customs", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
};

export default function WarehousePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("cargo");

  const filteredCargo = mockCargo.filter(c => {
    const matchSearch = !search ||
      c.ref.toLowerCase().includes(search.toLowerCase()) ||
      c.shipper.toLowerCase().includes(search.toLowerCase()) ||
      c.consignee.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.blRef?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: mockCargo.length,
    receiving: mockCargo.filter(c => c.status === "receiving").length,
    stored: mockCargo.filter(c => c.status === "stored" || c.status === "tallied").length,
    held: mockCargo.filter(c => c.status === "held").length,
    dispatched: mockCargo.filter(c => c.status === "dispatched" || c.status === "loaded").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-primary" />
            Warehouse Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            SLAC Warehouse — Cargo tracking, tallying & dispatch
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Receive Cargo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Cargo", value: stats.total, icon: Box, color: "text-primary" },
          { label: "Receiving", value: stats.receiving, icon: Package, color: "text-info" },
          { label: "Stored / Tallied", value: stats.stored, icon: CheckCircle, color: "text-success" },
          { label: "Held", value: stats.held, icon: AlertTriangle, color: "text-destructive" },
          { label: "Ready / Dispatched", value: stats.dispatched, icon: Truck, color: "text-warning" },
        ].map(stat => (
          <Card key={stat.label} className="border border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn("h-8 w-8 opacity-20", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="cargo">
            <Box className="h-4 w-4 mr-2" />
            Cargo Register
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="h-4 w-4 mr-2" />
            Warehouse Locations
          </TabsTrigger>
          <TabsTrigger value="tally">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tally Sheets
          </TabsTrigger>
          <TabsTrigger value="dispatch">
            <Truck className="h-4 w-4 mr-2" />
            Dispatch Queue
          </TabsTrigger>
        </TabsList>

        {/* Cargo Register */}
        <TabsContent value="cargo">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <CardTitle className="text-base">Cargo Register</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cargo, BL, shipper..."
                      className="pl-9 h-9"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-40">
                      <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="receiving">Receiving</SelectItem>
                      <SelectItem value="stored">Stored</SelectItem>
                      <SelectItem value="tallied">Tallied</SelectItem>
                      <SelectItem value="loaded">Loaded</SelectItem>
                      <SelectItem value="held">Held</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold">Cargo Ref</TableHead>
                    <TableHead className="text-xs font-semibold">Shipper / Consignee</TableHead>
                    <TableHead className="text-xs font-semibold">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Pkgs</TableHead>
                    <TableHead className="text-xs font-semibold">Weight</TableHead>
                    <TableHead className="text-xs font-semibold">Location</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Received</TableHead>
                    <TableHead className="text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCargo.map(cargo => {
                    const cfg = statusConfig[cargo.status];
                    return (
                      <TableRow key={cargo.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-mono text-xs font-semibold text-primary">{cargo.ref}</div>
                          {cargo.blRef && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{cargo.blRef}</div>
                          )}
                          {cargo.consolidationRef && (
                            <div className="text-[10px] text-accent mt-0.5">{cargo.consolidationRef}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{cargo.shipper}</div>
                          <div className="text-[10px] text-muted-foreground">→ {cargo.consignee}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{cargo.description}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-semibold">{cargo.packages}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{cargo.weight}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            {cargo.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px] px-2 py-0.5", cfg.color)}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">{cargo.receivedDate}</div>
                          <div className="text-[10px] text-muted-foreground">{cargo.receivedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ClipboardList className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouse Locations */}
        <TabsContent value="locations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouseLocations.map(loc => {
              const utilPercent = Math.round((loc.used / loc.capacity) * 100);
              const isHigh = utilPercent >= 80;
              const isMed = utilPercent >= 50 && utilPercent < 80;
              return (
                <Card key={loc.id} className="border border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-primary" />
                        {loc.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {loc.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{loc.used} / {loc.capacity} units</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          isHigh ? "bg-destructive" : isMed ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${utilPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-xs font-semibold",
                        isHigh ? "text-destructive" : isMed ? "text-warning" : "text-success"
                      )}>
                        {utilPercent}% utilized
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {loc.capacity - loc.used} available
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tally Sheets */}
        <TabsContent value="tally">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Tally Sheets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCargo.filter(c => c.status !== "dispatched").map(cargo => {
                  const cfg = statusConfig[cargo.status];
                  return (
                    <div key={cargo.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <cfg.icon className={cn(
                          "h-5 w-5",
                          cargo.status === "tallied" ? "text-success" :
                          cargo.status === "held" ? "text-destructive" : "text-muted-foreground"
                        )} />
                        <div>
                          <div className="font-mono text-sm font-semibold">{cargo.ref}</div>
                          <div className="text-xs text-muted-foreground">{cargo.shipper} → {cargo.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{cargo.packages} pkgs</div>
                          <div className="text-xs text-muted-foreground">{cargo.weight}</div>
                        </div>
                        <Badge className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          {cargo.status === "stored" ? "Tally" :
                           cargo.status === "tallied" ? "Verified ✓" : "View"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispatch Queue */}
        <TabsContent value="dispatch">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Dispatch Queue
                </CardTitle>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Dispatch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCargo.filter(c => c.status === "tallied" || c.status === "loaded").map(cargo => (
                  <div key={cargo.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-primary">{cargo.ref}</div>
                        <div className="text-xs text-muted-foreground">{cargo.consignee}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {cargo.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{cargo.packages} packages</div>
                        <div className="text-xs text-muted-foreground">{cargo.weight}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Assign Driver
                        </Button>
                        <Button size="sm" className="text-xs h-8 bg-success text-success-foreground hover:bg-success/90">
                          Dispatch
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {mockCargo.filter(c => c.status === "tallied" || c.status === "loaded").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No items ready for dispatch</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
