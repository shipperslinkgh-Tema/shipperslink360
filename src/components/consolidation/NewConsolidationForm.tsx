import { useState } from "react";
import { Ship, Plane, Plus, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface NewConsolidationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PORT_LABEL: Record<string, { destination: string; port: string }> = {
  tema: { destination: "Tema Port, Ghana", port: "Tema" },
  takoradi: { destination: "Takoradi Port, Ghana", port: "Takoradi" },
  kotoka: { destination: "Kotoka Int'l Airport, Ghana", port: "Kotoka" },
};

const CARRIER_LABEL: Record<string, string> = {
  msc: "MSC", maersk: "Maersk", hapag: "Hapag-Lloyd", oocl: "OOCL", cosco: "COSCO",
  emirates: "Emirates SkyCargo", ethiopian: "Ethiopian Airlines Cargo",
  ba: "British Airways Cargo", turkish: "Turkish Cargo", qatar: "Qatar Airways Cargo",
};

const WAREHOUSE_LABEL: Record<string, string> = {
  "slac-a": "SLAC Warehouse A - Tema",
  "slac-b": "SLAC Warehouse B - Tema",
  "kia": "KIA Cargo Terminal - Accra",
};

const initialForm = {
  origin: "",
  destinationKey: "tema",
  etd: "",
  eta: "",
  carrierKey: "",
  vessel: "",
  voyage: "",
  flight: "",
  mawb: "",
  containerNumber: "",
  containerType: "",
  stuffingDate: "",
  cutoffDate: "",
  uld: "",
  uldType: "",
  warehouseKey: "",
};

export function NewConsolidationForm({ open, onOpenChange }: NewConsolidationFormProps) {
  const [consolidationType, setConsolidationType] = useState<"LCL" | "AIR">("LCL");
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm(initialForm);
    setConsolidationType("LCL");
  };

  const generateRef = (type: "LCL" | "AIR") => {
    const yr = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${type === "LCL" ? "CONS" : "AIR"}-${yr}-${rand}`;
  };

  const handleSubmit = async () => {
    if (!form.origin) {
      toast({ title: "Origin required", variant: "destructive" });
      return;
    }
    const carrier = CARRIER_LABEL[form.carrierKey];
    if (!carrier) {
      toast({ title: "Carrier required", variant: "destructive" });
      return;
    }
    const dest = PORT_LABEL[form.destinationKey];

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload: any = {
        consolidation_ref: generateRef(consolidationType),
        type: consolidationType,
        origin: form.origin,
        destination: dest.destination,
        port: dest.port,
        carrier,
        status: "planning",
        etd: form.etd || null,
        eta: form.eta || null,
        warehouse: WAREHOUSE_LABEL[form.warehouseKey] || null,
        created_by: userData.user?.id ?? null,
      };

      if (consolidationType === "LCL") {
        payload.vessel = form.vessel || null;
        payload.voyage = form.voyage || null;
        payload.container_number = form.containerNumber || null;
        payload.container_type = form.containerType || null;
        payload.stuffing_date = form.stuffingDate || null;
        payload.cutoff_date = form.cutoffDate || null;
      } else {
        payload.flight = form.flight || null;
        payload.master_awb_number = form.mawb || null;
        payload.container_number = form.uld || null;
        payload.container_type = form.uldType || null;
      }

      const { error } = await supabase.from("consolidations").insert(payload);
      if (error) throw error;

      toast({ title: "Consolidation created", description: payload.consolidation_ref });
      queryClient.invalidateQueries({ queryKey: ["consolidations"] });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Failed to create consolidation", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
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
            <Ship className={cn("h-8 w-8 mx-auto mb-2", consolidationType === "LCL" ? "text-accent" : "text-muted-foreground")} />
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
            <Plane className={cn("h-8 w-8 mx-auto mb-2", consolidationType === "AIR" ? "text-info" : "text-muted-foreground")} />
            <p className="font-medium">Air Cargo</p>
            <p className="text-xs text-muted-foreground mt-1">Air freight consolidation</p>
          </button>
        </div>

        <Tabs defaultValue="route" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="carrier">Carrier</TabsTrigger>
            <TabsTrigger value="container">{consolidationType === "LCL" ? "Container" : "ULD"}</TabsTrigger>
          </TabsList>

          <TabsContent value="route" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" placeholder="e.g., Shanghai, China" value={form.origin} onChange={(e) => update("origin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Select value={form.destinationKey} onValueChange={(v) => update("destinationKey", v)}>
                  <SelectTrigger><SelectValue placeholder="Select port" /></SelectTrigger>
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
                <Input id="etd" type="date" value={form.etd} onChange={(e) => update("etd", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta">ETA (Estimated Arrival)</Label>
                <Input id="eta" type="date" value={form.eta} onChange={(e) => update("eta", e.target.value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="carrier" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Carrier / Shipping Line</Label>
              <Select value={form.carrierKey} onValueChange={(v) => update("carrierKey", v)}>
                <SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger>
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
                  <Input id="vessel" placeholder="e.g., MSC GULSUN" value={form.vessel} onChange={(e) => update("vessel", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voyage">Voyage Number</Label>
                  <Input id="voyage" placeholder="e.g., FE401W" value={form.voyage} onChange={(e) => update("voyage", e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flight">Flight Number</Label>
                  <Input id="flight" placeholder="e.g., EK787" value={form.flight} onChange={(e) => update("flight", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawb">Master AWB</Label>
                  <Input id="mawb" placeholder="e.g., 071-12345678" value={form.mawb} onChange={(e) => update("mawb", e.target.value)} />
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
                    <Input id="container" placeholder="e.g., MSCU1234567" value={form.containerNumber} onChange={(e) => update("containerNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Container Type</Label>
                    <Select value={form.containerType} onValueChange={(v) => update("containerType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                    <Input id="stuffingDate" type="date" value={form.stuffingDate} onChange={(e) => update("stuffingDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cutoff">Cut-off Date</Label>
                    <Input id="cutoff" type="date" value={form.cutoffDate} onChange={(e) => update("cutoffDate", e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uld">ULD Number</Label>
                  <Input id="uld" placeholder="e.g., AKE12345EK" value={form.uld} onChange={(e) => update("uld", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ULD Type</Label>
                  <Select value={form.uldType} onValueChange={(v) => update("uldType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
              <Label>Warehouse Location</Label>
              <Select value={form.warehouseKey} onValueChange={(v) => update("warehouseKey", v)}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Create Consolidation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
