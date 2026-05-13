import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ICONS: Record<string, any> = {
  success: CheckCircle2, warning: AlertTriangle, info: Info, error: AlertTriangle,
};
const COLORS: Record<string, string> = {
  success: "text-emerald-500", warning: "text-amber-500", info: "text-primary", error: "text-destructive",
};

export default function ClientNotifications() {
  const { user } = useClientAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false }).limit(100);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel("client-notifs")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() })
      .eq("recipient_id", user.id).eq("is_read", false);
    load();
  };

  const handleClick = async (n: any) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", n.id);
    }
    if (n.action_url) {
      if (n.action_url.startsWith("http")) window.open(n.action_url, "_blank");
      else navigate(n.action_url);
    }
    load();
  };

  const unread = items.filter(i => !i.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card><CardContent className="text-center py-16 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No notifications yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const Icon = ICONS[n.type] || Info;
            return (
              <Card
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/40",
                  !n.is_read && "border-primary/40 bg-primary/5"
                )}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", COLORS[n.type] || "text-muted-foreground")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium truncate", !n.is_read && "font-semibold")}>{n.title}</p>
                      {!n.is_read && <Badge className="h-4 px-1 text-[10px] bg-primary text-primary-foreground border-0">NEW</Badge>}
                    </div>
                    {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
