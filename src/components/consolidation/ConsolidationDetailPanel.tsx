import { Ship, Plane, X, Package, FileText, Clock, MapPin, Truck, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Consolidation, Shipper, DemurrageRecord } from "@/types/consolidation";
import { ShipperDetailsTable } from "./ShipperDetailsTable";
import { cn } from "@/lib/utils";

interface ConsolidationDetailPanelProps {
  consolidation: Consolidation;
  shippers: Shipper[];
  demurrage?: DemurrageRecord;
  onClose: () => void;
}

const getStatusProgress = (status: Consolidation["status"]) => {
  const progressMap: Record<Consolidation["status"], number> = {
    planning: 10,
    receiving: 25,
    stuffing: 40,
    customs: 60,
    "in-transit": 75,
    arrived: 85,
    delivered: 95,
    closed: 100,
  };
  return progressMap[status];
};

export function ConsolidationDetailPanel({
  consolidation,
  shippers,
  demurrage,
  onClose,
}: ConsolidationDetailPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalCharges = shippers.reduce((sum, s) => sum + s.totalCharge, 0);
  const totalDuty = shippers.reduce((sum, s) => sum + (s.dutyAmount || 0), 0);
  const paidCount = shippers.filter((s) => s.paid).length;
  const releasedCount = shippers.filter((s) => s.releaseStatus === "released").length;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-lg",
            consolidation.type === "LCL" ? "bg-accent/10" : "bg-info/10"
          )}>
            {consolidation.type === "LCL" ? (
              <Ship className="h-5 w-5 text-accent" />
            ) : (
              <Plane className="h-5 w-5 text-info" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {consolidation.consolidationRef}
            </h2>
            <p className="text-sm text-muted-foreground">
              {consolidation.masterBLNumber || consolidation.masterAWBNumber}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium capitalize">{consolidation.status.replace("-", " ")}</span>
          <span className="text-sm text-muted-foreground">{getStatusProgress(consolidation.status)}%</span>
        </div>
        <Progress value={getStatusProgress(consolidation.status)} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">Shippers</span>
              </div>
              <p className="text-xl font-bold mt-1">{consolidation.shippersCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <p className="text-xl font-bold mt-1">{formatCurrency(totalCharges)}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Paid</span>
              </div>
              <p className="text-xl font-bold mt-1">{paidCount}/{shippers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-info" />
                <span className="text-xs text-muted-foreground">Released</span>
              </div>
              <p className="text-xl font-bold mt-1">{releasedCount}/{shippers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shippers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shippers">Shippers</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="shippers" className="mt-4">
            <ShipperDetailsTable shippers={shippers} />
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Shipment Details */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Origin</p>
                  <p className="font-medium">{consolidation.origin}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-medium">{consolidation.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carrier</p>
                  <p className="font-medium">{consolidation.carrier}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vessel/Flight</p>
                  <p className="font-medium">{consolidation.vessel || consolidation.flight}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ETD</p>
                  <p className="font-medium">{new Date(consolidation.etd).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ETA</p>
                  <p className="font-medium">{new Date(consolidation.eta).toLocaleDateString()}</p>
                </div>
                {consolidation.containerNumber && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Container</p>
                      <p className="font-mono font-medium">{consolidation.containerNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium">{consolidation.containerType}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cargo Summary */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cargo Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total CBM</p>
                  <p className="text-2xl font-bold">{consolidation.totalCBM} m³</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Weight</p>
                  <p className="text-2xl font-bold">{consolidation.totalWeight.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Packages</p>
                  <p className="text-2xl font-bold">{consolidation.totalPackages}</p>
                </div>
              </CardContent>
            </Card>

            {/* Demurrage Alert */}
            {demurrage && (
              <Card className={cn(
                "border",
                demurrage.status === "critical" ? "border-destructive bg-destructive/5" :
                demurrage.status === "demurrage" ? "border-warning bg-warning/5" :
                "border-border"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      demurrage.status === "critical" ? "text-destructive" :
                      demurrage.status === "demurrage" ? "text-warning" :
                      "text-muted-foreground"
                    )} />
                    Demurrage & Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Free Days Left</p>
                    <p className="text-xl font-bold">
                      {demurrage.freeTimeDays - demurrage.currentDays}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Demurrage Days</p>
                    <p className="text-xl font-bold">{demurrage.demurrageDays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Demurrage Charges</p>
                    <p className="text-xl font-bold">{formatCurrency(demurrage.totalDemurrage)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Storage Charges</p>
                    <p className="text-xl font-bold">{formatCurrency(demurrage.totalStorage)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  Document management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Freight Charges</p>
                  <p className="text-xl font-bold">{formatCurrency(totalCharges)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Duty & Taxes</p>
                  <p className="text-xl font-bold">{formatCurrency(totalDuty)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoiced</p>
                  <p className="text-xl font-bold">
                    {shippers.filter(s => s.invoiced).length}/{shippers.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(shippers.filter(s => s.paid).reduce((sum, s) => sum + s.totalCharge, 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border p-4 bg-card flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate MBL
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Create Invoices
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Schedule Delivery
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90">
            <Package className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
