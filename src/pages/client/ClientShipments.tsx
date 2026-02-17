import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ship, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_transit: "bg-primary/10 text-primary",
  at_port: "bg-warning/10 text-warning",
  customs_clearance: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  on_hold: "bg-destructive/10 text-destructive",
};

export default function ClientShipments() {
  const { clientProfile } = useClientAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientProfile) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("client_shipments")
        .select("*")
        .eq("customer_id", clientProfile.customer_id)
        .order("created_at", { ascending: false });
      setShipments(data || []);
      setLoading(false);
    };
    fetch();
  }, [clientProfile]);

  const filtered = shipments.filter(s =>
    s.bl_number.toLowerCase().includes(search.toLowerCase()) ||
    (s.container_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.vessel_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Ship className="h-6 w-6 text-primary" /> My Shipments</h1>
        <p className="text-muted-foreground text-sm">Track all your shipments in real-time</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by BL, container, or vessel..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading shipments...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No shipments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BL Number</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm font-medium">{s.bl_number}</TableCell>
                    <TableCell className="font-mono text-sm">{s.container_number || "—"}</TableCell>
                    <TableCell>{s.vessel_name || "—"}</TableCell>
                    <TableCell>{s.origin}</TableCell>
                    <TableCell>{s.destination}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[s.status] || ""} border-0 capitalize`}>
                        {s.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{s.eta ? new Date(s.eta).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
