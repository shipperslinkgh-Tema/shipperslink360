import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  event_type: string;
  source_department: string | null;
  consignment_ref: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  stage_changed: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  document_uploaded: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  invoice_paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  trip_started: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

function describe(e: ActivityEvent): string {
  const ref = e.consignment_ref ? `${e.consignment_ref} — ` : "";
  switch (e.event_type) {
    case "stage_changed": {
      const from = (e.payload as any)?.from;
      const to = (e.payload as any)?.to;
      return `${ref}stage ${from ?? "?"} → ${to ?? "?"}`;
    }
    case "document_uploaded":
      return `${ref}document uploaded`;
    case "invoice_paid":
      return `${ref}invoice paid`;
    case "trip_started":
      return `${ref}trip started`;
    default:
      return `${ref}${e.event_type.replace(/_/g, " ")}`;
  }
}

export function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("consignment_events")
        .select("id,event_type,source_department,consignment_ref,payload,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled && data) setEvents(data as ActivityEvent[]);
    };
    load();

    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "consignment_events" },
        (payload) => {
          setEvents((prev) => [payload.new as ActivityEvent, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <Activity className="h-4 w-4 text-primary" />
        <CardTitle className="text-base">Live Activity</CardTitle>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Real-time
        </span>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/40">
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-[10px] uppercase ${TYPE_COLORS[e.event_type] ?? ""}`}
                >
                  {e.source_department ?? "system"}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{describe(e)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
