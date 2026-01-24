import { useState } from "react";
import { Ship, Plane, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface NewConsolidationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConsolidationForm({ open, onOpenChange }: NewConsolidationFormProps) {
  const [consolidationType, setConsolidationType] = useState<"LCL" | "AIR">("LCL");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Consolidation</DialogTitle>
          <DialogDescription>
            Set up a new {consolidationType === "LCL" ? "LCL sea freight" : "air cargo"} consolidation
          </DialogDescription>
        </DialogHeader>

        {/* Type Selection */}
        <div className="flex gap-4 py-4">
          <button
            onClick={() => setConsolidationType("LCL")}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all",
              consolidationType === "LCL"
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
            )}
          >
            <Ship className={cn(
              "h-8 w-8 mx-auto mb-2",
              consolidationType === "LCL" ? "text-accent" : "text-muted-foreground"
            )} />
            <p className="font-medium">LCL Sea Freight</p>
            <p className="text-xs text-muted-foreground mt-1">Container consolidation</p>
          </button>
          <button
            onClick={() => setConsolidationType("AIR")}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all",
              consolidationType === "AIR"
                ? "border-info bg-info/10"
                : "border-border hover:border-info/50"
            )}
          >
            <Plane className={cn(
              "h-8 w-8 mx-auto mb-2",
              consolidationType === "AIR" ? "text-info" : "text-muted-foreground"
            )} />
            <p className="font-medium">Air Cargo</p>
            <p className="text-xs text-muted-foreground mt-1">Air freight consolidation</p>
          </button>
        </div>

        <Tabs defaultValue="route" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="carrier">Carrier</TabsTrigger>
            <TabsTrigger value="container">
              {consolidationType === "LCL" ? "Container" : "ULD"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="route" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" placeholder="e.g., Shanghai, China" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Select defaultValue="tema">
                  <SelectTrigger>
                    <SelectValue placeholder="Select port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tema">Tema Port, Ghana</SelectItem>
                    <SelectItem value="takoradi">Takoradi Port, Ghana</SelectItem>
                    <SelectItem value="kotoka">Kotoka Int'l Airport, Ghana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="etd">ETD (Estimated Departure)</Label>
                <Input id="etd" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta">ETA (Estimated Arrival)</Label>
                <Input id="eta" type="date" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="carrier" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier / Shipping Line</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {consolidationType === "LCL" ? (
                    <>
                      <SelectItem value="msc">MSC</SelectItem>
                      <SelectItem value="maersk">Maersk</SelectItem>
                      <SelectItem value="hapag">Hapag-Lloyd</SelectItem>
                      <SelectItem value="oocl">OOCL</SelectItem>
                      <SelectItem value="cosco">COSCO</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="emirates">Emirates SkyCargo</SelectItem>
                      <SelectItem value="ethiopian">Ethiopian Airlines Cargo</SelectItem>
                      <SelectItem value="ba">British Airways Cargo</SelectItem>
                      <SelectItem value="turkish">Turkish Cargo</SelectItem>
                      <SelectItem value="qatar">Qatar Airways Cargo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            {consolidationType === "LCL" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel">Vessel Name</Label>
                  <Input id="vessel" placeholder="e.g., MSC GULSUN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voyage">Voyage Number</Label>
                  <Input id="voyage" placeholder="e.g., FE401W" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flight">Flight Number</Label>
                  <Input id="flight" placeholder="e.g., EK787" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawb">Master AWB</Label>
                  <Input id="mawb" placeholder="e.g., 071-12345678" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="container" className="space-y-4 mt-4">
            {consolidationType === "LCL" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="container">Container Number</Label>
                    <Input id="container" placeholder="e.g., MSCU1234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Container Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20GP">20' GP</SelectItem>
                        <SelectItem value="40GP">40' GP</SelectItem>
                        <SelectItem value="40HC">40' HC</SelectItem>
                        <SelectItem value="45HC">45' HC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stuffingDate">Stuffing Date</Label>
                    <Input id="stuffingDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cutoff">Cut-off Date</Label>
                    <Input id="cutoff" type="date" />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uld">ULD Number</Label>
                  <Input id="uld" placeholder="e.g., AKE12345EK" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uldType">ULD Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ake">AKE (LD3)</SelectItem>
                      <SelectItem value="pmc">PMC (Pallet)</SelectItem>
                      <SelectItem value="pag">PAG (Pallet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slac-a">SLAC Warehouse A - Tema</SelectItem>
                  <SelectItem value="slac-b">SLAC Warehouse B - Tema</SelectItem>
                  <SelectItem value="kia">KIA Cargo Terminal - Accra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Consolidation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
