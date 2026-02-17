import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, FileText, DollarSign, MessageSquare, Package, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const { clientProfile } = useClientAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ shipments: 0, documents: 0, invoices: 0, messages: 0 });

  useEffect(() => {
    if (!clientProfile) return;
    const fetchStats = async () => {
      const [shipRes, docRes, invRes, msgRes] = await Promise.all([
        supabase.from("client_shipments").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_documents").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_invoices").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id),
        supabase.from("client_messages").select("id", { count: "exact", head: true }).eq("customer_id", clientProfile.customer_id).eq("is_read", false),
      ]);
      setStats({
        shipments: shipRes.count || 0,
        documents: docRes.count || 0,
        invoices: invRes.count || 0,
        messages: msgRes.count || 0,
      });
    };
    fetchStats();
  }, [clientProfile]);

  const cards = [
    { title: "Active Shipments", value: stats.shipments, icon: Ship, color: "text-primary", path: "/portal/shipments" },
    { title: "Documents & SOPs", value: stats.documents, icon: FileText, color: "text-success", path: "/portal/documents" },
    { title: "Invoices", value: stats.invoices, icon: DollarSign, color: "text-warning", path: "/portal/invoices" },
    { title: "Unread Messages", value: stats.messages, icon: MessageSquare, color: "text-info", path: "/portal/messages" },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-10 w-10 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => navigate("/portal/shipments")} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
              <Ship className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Track Shipments</p>
                <p className="text-xs text-muted-foreground">View real-time shipment status</p>
              </div>
            </button>
            <button onClick={() => navigate("/portal/documents")} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
              <FileText className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-sm">Documents & SOPs</p>
                <p className="text-xs text-muted-foreground">Access shipping documents</p>
              </div>
            </button>
            <button onClick={() => navigate("/portal/invoices")} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
              <DollarSign className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-sm">Invoices & Payments</p>
                <p className="text-xs text-muted-foreground">View billing & payment history</p>
              </div>
            </button>
            <button onClick={() => navigate("/portal/messages")} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
              <MessageSquare className="h-5 w-5 text-info" />
              <div>
                <p className="font-medium text-sm">Messages</p>
                <p className="text-xs text-muted-foreground">Contact SLAC team</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
