import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Anchor,
  Container,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Truck,
  Ship,
  MapPin,
  Calendar,
} from "lucide-react";

// Mock data for GPHA operations
const containerYardStatus = [
  {
    id: "1",
    containerNo: "MSKU1234567",
    blNumber: "MAEU123456789",
    size: "40HC",
    status: "ready_for_pickup",
    location: "Block A, Row 12, Tier 3",
    arrivalDate: "2024-01-15",
    freeTimeDays: 3,
    storageCharges: 0,
    vessel: "MAERSK SEALAND",
    consignee: "Global Traders Ltd",
  },
  {
    id: "2",
    containerNo: "TCLU8765432",
    blNumber: "COSCO987654321",
    size: "20GP",
    status: "customs_hold",
    location: "Block C, Row 5, Tier 1",
    arrivalDate: "2024-01-10",
    freeTimeDays: 0,
    storageCharges: 450,
    vessel: "COSCO SHIPPING",
    consignee: "Accra Imports Co",
  },
  {
    id: "3",
    containerNo: "HLXU5678901",
    blNumber: "HLCU567890123",
    size: "40GP",
    status: "awaiting_exam",
    location: "Exam Bay 3",
    arrivalDate: "2024-01-12",
    freeTimeDays: 1,
    storageCharges: 150,
    vessel: "HAPAG LLOYD",
    consignee: "West Africa Trading",
  },
  {
    id: "4",
    containerNo: "OOLU3456789",
    blNumber: "OOLU345678901",
    size: "20GP",
    status: "delivered",
    location: "Gate Out",
    arrivalDate: "2024-01-08",
    freeTimeDays: 0,
    storageCharges: 0,
    vessel: "OOCL HOUSTON",
    consignee: "Ghana Commodities",
  },
];

const gatePassRequests = [
  {
    id: "GP001",
    containerNo: "MSKU1234567",
    truckNo: "GW-1234-24",
    driver: "Kofi Mensah",
    requestTime: "2024-01-18 09:30",
    status: "approved",
    approvalTime: "2024-01-18 09:45",
  },
  {
    id: "GP002",
    containerNo: "TCLU8765432",
    truckNo: "GT-5678-24",
    driver: "Kwame Asante",
    requestTime: "2024-01-18 10:15",
    status: "pending",
    approvalTime: null,
  },
  {
    id: "GP003",
    containerNo: "HLXU5678901",
    truckNo: "GE-9012-24",
    driver: "Yaw Boateng",
    requestTime: "2024-01-18 11:00",
    status: "rejected",
    approvalTime: "2024-01-18 11:30",
  },
];

const vesselSchedule = [
  {
    id: "1",
    vesselName: "MAERSK SEALAND",
    voyageNo: "V234E",
    eta: "2024-01-20 06:00",
    etd: "2024-01-21 18:00",
    berth: "Berth 5",
    status: "expected",
    containers: 245,
  },
  {
    id: "2",
    vesselName: "MSC OSCAR",
    voyageNo: "M456W",
    eta: "2024-01-18 14:00",
    etd: "2024-01-19 22:00",
    berth: "Berth 3",
    status: "berthed",
    containers: 189,
  },
  {
    id: "3",
    vesselName: "COSCO SHIPPING",
    voyageNo: "C789N",
    eta: "2024-01-17 08:00",
    etd: "2024-01-18 16:00",
    berth: "Berth 1",
    status: "discharging",
    containers: 312,
  },
];

const statusColors: Record<string, string> = {
  ready_for_pickup: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  customs_hold: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  awaiting_exam: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expected: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  berthed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  discharging: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const GPHAPortStatus = () => {
  const [activeTab, setActiveTab] = useState("containers");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    {
      label: "Total Containers",
      value: "1,245",
      icon: Container,
      color: "text-blue-600",
    },
    {
      label: "Ready for Pickup",
      value: "342",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Customs Hold",
      value: "87",
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      label: "Vessels at Berth",
      value: "4",
      icon: Ship,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Anchor className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GPHA Port Status</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Ghana Ports and Harbours Authority - Container & Vessel Operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync GPHA
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Status Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">GPHA Integration Active</p>
              <p className="text-sm text-muted-foreground">
                Last synced: 2 minutes ago • Real-time container tracking enabled
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Connected
          </Badge>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="containers" className="gap-2">
            <Container className="h-4 w-4" />
            Container Yard
          </TabsTrigger>
          <TabsTrigger value="gate-passes" className="gap-2">
            <Truck className="h-4 w-4" />
            Gate Passes
          </TabsTrigger>
          <TabsTrigger value="vessels" className="gap-2">
            <Ship className="h-4 w-4" />
            Vessel Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="containers" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Container Yard Status</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track container locations and pickup readiness at Tema Port
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search container or BL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                      <SelectItem value="customs_hold">Customs Hold</SelectItem>
                      <SelectItem value="awaiting_exam">Awaiting Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Container</TableHead>
                    <TableHead>BL Number</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Free Time</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {containerYardStatus.map((container) => (
                    <TableRow key={container.id}>
                      <TableCell className="font-mono font-medium">
                        {container.containerNo}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {container.blNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{container.size}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{container.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{container.vessel}</TableCell>
                      <TableCell>
                        {container.freeTimeDays > 0 ? (
                          <span className="text-green-600 font-medium">
                            {container.freeTimeDays} days left
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">Expired</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {container.storageCharges > 0 ? (
                          <span className="text-red-600 font-semibold">
                            GHS {container.storageCharges.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[container.status]}>
                          {container.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Request Gate Pass
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="h-4 w-4 mr-2" />
                              Assign Truck
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gate-passes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gate Pass Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage container pickup authorizations
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gate Pass #</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Truck No.</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Request Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gatePassRequests.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell className="font-mono font-medium">{pass.id}</TableCell>
                      <TableCell className="font-mono">{pass.containerNo}</TableCell>
                      <TableCell>{pass.truckNo}</TableCell>
                      <TableCell>{pass.driver}</TableCell>
                      <TableCell className="text-sm">{pass.requestTime}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[pass.status]}>
                          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vessels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">
                Expected arrivals and departures at Tema Port
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vessel Name</TableHead>
                    <TableHead>Voyage</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>ETD</TableHead>
                    <TableHead>Berth</TableHead>
                    <TableHead>Containers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vesselSchedule.map((vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">{vessel.vesselName}</TableCell>
                      <TableCell className="font-mono">{vessel.voyageNo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {vessel.eta}
                        </div>
                      </TableCell>
                      <TableCell>{vessel.etd}</TableCell>
                      <TableCell>{vessel.berth}</TableCell>
                      <TableCell>{vessel.containers}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[vessel.status]}>
                          {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GPHAPortStatus;
