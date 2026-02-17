import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, ArrowDownLeft, ArrowUpRight, AlertTriangle, Landmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function BankAlertsPanel() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["bank-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_alerts")
        .select("*, bank_connections(bank_display_name)")
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription for new alerts
  useEffect(() => {
    const channel = supabase
      .channel("bank-alerts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bank_alerts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["bank-alerts"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const dismissAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("bank_alerts")
        .update({ is_dismissed: true })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-alerts"] }),
  });

  const markRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("bank_alerts")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-alerts"] }),
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "credit_received": return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case "debit_processed": return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case "failed_transaction": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "low_balance": return <Landmark className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-destructive bg-destructive/5";
      case "medium": return "border-l-amber-500 bg-amber-500/5";
      default: return "border-l-muted-foreground bg-muted/50";
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Transaction Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active alerts.</p>
            <p className="text-sm mt-1">Transaction alerts will appear here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "relative flex gap-3 rounded-lg border-l-4 p-4 transition-colors cursor-pointer",
                  getPriorityColor(alert.priority),
                  !alert.is_read && "ring-1 ring-primary/20"
                )}
                onClick={() => !alert.is_read && markRead.mutate(alert.id)}
              >
                <div className="mt-0.5">{getAlertIcon(alert.alert_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !alert.is_read && "font-semibold")}>{alert.title}</p>
                    {!alert.is_read && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {(alert as any).bank_connections?.bank_display_name}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => { e.stopPropagation(); dismissAlert.mutate(alert.id); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
