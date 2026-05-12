import { useEffect, useState } from "react";
import { Ship, Plane, Truck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Row {
  id: string;
  ref: string;
  bl: string | null;
  client: string;
  origin: string;
  destination: string;
  type: string;
  stage: string;
  eta: string | null;
}

const stageStyle: Record<string, string> = {
  documents_received: "status-pending",
  documentation_started: "status-pending",
  customs_declared: "status-warning",
  duty_paid: "status-warning",
  port_processing: "status-warning",
  cargo_released: "status-info",
  truck_assigned: "status-info",
  delivery_started: "status-info",
  delivery_completed: "status-success",
};

function getTypeIcon(t: string) {
  if (t === "air") return <Plane className="h-4 w-4" />;
  if (t === "road") return <Truck className="h-4 w-4" />;
  return <Ship className="h-4 w-4" />;
}

export function RecentShipmentsTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("consignment_workflows")
        .select("id, consignment_ref, bl_number, client_name, origin_country, port_of_discharge, shipment_type, current_stage, eta")
        .order("created_at", { ascending: false })
        .limit(8);
      setRows(
        (data || []).map((d: any) => ({
          id: d.id,
          ref: d.consignment_ref,
          bl: d.bl_number,
          client: d.client_name,
          origin: d.origin_country || "—",
          destination: d.port_of_discharge || "—",
          type: d.shipment_type,
          stage: d.current_stage,
          eta: d.eta,
        }))
      );
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Shipments</h3>
        <Link to="/consignment-workflows">
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
            View All <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">No shipments yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ref / BL</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Route</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Stage</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="data-row">
                  <td className="px-5 py-4">
                    <div className="font-mono text-sm font-medium text-foreground">{r.ref}</div>
                    {r.bl && <div className="text-xs text-muted-foreground">{r.bl}</div>}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{r.client}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{r.origin}</span>
                      <span className="mx-2 text-muted-foreground/50">→</span>
                      <span className="text-foreground">{r.destination}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getTypeIcon(r.type)}
                      <span className="text-sm capitalize">{r.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("status-badge", stageStyle[r.stage] || "status-pending")}>
                      {r.stage.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {r.eta ? new Date(r.eta).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
