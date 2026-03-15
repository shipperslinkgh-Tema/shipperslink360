import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, FileText, DollarSign, MessageSquare, Package, Clock, ArrowRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_transit: "bg-primary/10 text-primary",
  at_port: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  customs_clearance: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  on_hold: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function ClientDashboard() {
  const { clientProfile } = useClientAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ shipments: 0, documents: 0, invoices: 0, messages: 0 });
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);

  useEffect(() => {
    if (!clientProfile) return;
    const fetchAll = async () => {
      const [shipRes, docRes, invRes, msgRes, recentShipRes, pendingInvRes] = await Promise.all([
        supabase.from("client_shipments").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_documents").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_invoices").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_messages").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id).eq("is_read", false),
        supabase.from("client_shipments").select("*").eq("customer_id", clientProfile.customer_id).neq("status", "delivered").order("created_at", { ascending: false }).limit(5),
        supabase.from("client_invoices").select("*").eq("customer_id", clientProfile.customer_id).in("status", ["pending", "overdue", "partial"]).order("due_date", { ascending: true }).limit(5),
      ]);

      setStats({
        shipments: shipRes.count || 0,
        documents: docRes.count || 0,
        invoices: invRes.count || 0,
        messages: msgRes.count || 0,
      });
      setRecentShipments(recentShipRes.data || []);
      const invs = pendingInvRes.data || [];
      setPendingInvoices(invs);
      setOutstandingBalance(invs.reduce((sum: number, i: any) => sum + (Number(i.amount) - Number(i.paid_amount || 0)), 0));
    };
    fetchAll();
  }, [clientProfile]);

  const statCards = [
    { title: "Active Shipments", value: stats.shipments, icon: Ship, color: "text-primary", path: "/portal/shipments" },
    { title: "Documents", value: stats.documents, icon: FileText, color: "text-emerald-500", path: "/portal/documents" },
    { title: "Invoices", value: stats.invoices, icon: DollarSign, color: "text-amber-500", path: "/portal/invoices" },
    { title: "Unread Messages", value: stats.messages, icon: MessageSquare, color: "text-blue-500", path: "/portal/messages", highlight: stats.messages > 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {clientProfile?.contact_name}</h1>
          <p className="text-muted-foreground text-sm">{clientProfile?.company_name}</p>
        </div>
        {clientProfile?.last_login_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Last login: {new Date(clientProfile.last_login_at).toLocaleString()}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card
            key={card.title}
            className={cn("cursor-pointer hover:shadow-md transition-all", card.highlight && "border-primary/50")}
            onClick={() => navigate(card.path)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-0.5">{card.value}</p>
                </div>
                <card.icon className={cn("h-8 w-8 opacity-70", card.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Shipments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ship className="h-4 w-4 text-primary" />
                Active Shipments
              </CardTitle>
              <button onClick={() => navigate("/portal/shipments")} className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentShipments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active shipments</p>
            ) : (
              recentShipments.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate("/portal/shipments")}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Ship className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium truncate">{s.bl_number}</p>
                      <p className="text-xs text-muted-foreground">{s.origin} → {s.destination}</p>
                    </div>
                  </div>
                  <Badge className={cn("border-0 text-[10px] capitalize flex-shrink-0", STATUS_COLORS[s.status] || "")}>
                    {s.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                Pending Invoices
              </CardTitle>
              <button onClick={() => navigate("/portal/invoices")} className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {outstandingBalance > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-xs text-muted-foreground">Outstanding Balance</span>
                </div>
                <span className="text-sm font-bold text-destructive">GHS {outstandingBalance.toLocaleString()}</span>
              </div>
            )}
            {pendingInvoices.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">All invoices paid!</p>
              </div>
            ) : (
              pendingInvoices.map(inv => {
                const balance = Number(inv.amount) - Number(inv.paid_amount || 0);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate("/portal/invoices")}>
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{inv.currency} {balance.toLocaleString()}</p>
                      <Badge className={cn("border-0 text-[10px] capitalize",
                        inv.status === "overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      )}>
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" /> Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Track Shipments", desc: "Real-time status", icon: Ship, color: "text-primary", path: "/portal/shipments" },
              { label: "Documents", desc: "Download files", icon: FileText, color: "text-emerald-500", path: "/portal/documents" },
              { label: "Invoices", desc: "Payment status", icon: DollarSign, color: "text-amber-500", path: "/portal/invoices" },
              { label: "Messages", desc: "Contact SLAC", icon: MessageSquare, color: "text-blue-500", path: "/portal/messages" },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-center"
              >
                <item.icon className={cn("h-6 w-6", item.color)} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
