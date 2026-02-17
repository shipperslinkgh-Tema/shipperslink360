import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { Ship, FileText, DollarSign, MessageSquare, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { title: "Shipments", href: "/portal/shipments", icon: Ship },
  { title: "Documents", href: "/portal/documents", icon: FileText },
  { title: "Invoices", href: "/portal/invoices", icon: DollarSign },
  { title: "Messages", href: "/portal/messages", icon: MessageSquare },
];

export function ClientPortalLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { clientProfile, signOut } = useClientAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SLAC" className="h-9 w-9 object-contain" />
          <div>
            <h1 className="text-sm font-bold text-foreground">Client Portal</h1>
            <p className="text-xs text-muted-foreground">{clientProfile?.company_name}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/portal"}
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

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{clientProfile?.contact_name}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-border bg-card overflow-x-auto">
        {navItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/portal"}
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

      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
