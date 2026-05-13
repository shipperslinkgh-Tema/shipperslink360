import { ReactNode, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { LayoutDashboard, Ship, FileText, DollarSign, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { title: "Dashboard", href: "/portal", icon: LayoutDashboard, end: true },
  { title: "Shipments", href: "/portal/shipments", icon: Ship },
  { title: "Documents", href: "/portal/documents", icon: FileText },
  { title: "Financials", href: "/portal/financials", icon: DollarSign },
];

export function ClientPortalLayout({ children }: { children: ReactNode }) {
  const { clientProfile, user, signOut } = useClientAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase.from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id).eq("is_read", false);
      setUnread(count || 0);
    };
    load();
    const ch = supabase.channel("notif-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="SLAC" className="h-9 w-9 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground">Client Portal</h1>
            <p className="text-xs text-muted-foreground truncate">{clientProfile?.company_name}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink to="/portal/notifications" className={({ isActive }) => cn(
            "relative p-2 rounded-lg hover:bg-muted transition-colors",
            isActive && "bg-muted"
          )}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </NavLink>
          <span className="text-sm text-muted-foreground hidden sm:inline">{clientProfile?.contact_name}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <nav className="md:hidden flex items-center gap-1 px-3 py-2 border-b border-border bg-card overflow-x-auto">
        {navItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) => cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
