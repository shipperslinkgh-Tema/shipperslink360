import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Ship, Plane, Truck, Package, Warehouse, FileText, DollarSign, Settings, Bell, Users, ChevronDown, ChevronRight, Container, FileCheck, Anchor, BarChart3, Menu, X, User, LogOut, Sliders, BookOpen, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { filterNavItems } from "@/lib/departmentAccess";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: { title: string; href: string }[];
}

const navigation: NavItem[] = [{
  title: "Dashboard",
  icon: LayoutDashboard,
  href: "/"
}, {
  title: "Operations",
  icon: Package,
  children: [{
    title: "All Shipments",
    href: "/shipments"
  }, {
    title: "Sea Freight",
    href: "/shipments/sea"
  }, {
    title: "Air Freight",
    href: "/shipments/air"
  }, {
    title: "Consolidation",
    href: "/consolidation"
  }]
}, {
  title: "Customs & Ports",
  icon: FileCheck,
  children: [{
    title: "ICUMS Declarations",
    href: "/customs/icums"
  }, {
    title: "Shipping Lines / DO",
    href: "/shipping-lines"
  }, {
    title: "GPHA Port Status",
    href: "/customs/gpha"
  }]
}, {
  title: "Fleet & Logistics",
  icon: Truck,
  children: [{
    title: "Trucking",
    href: "/trucking"
  }, {
    title: "Warehousing",
    href: "/warehouse"
  }]
}, {
  title: "Accounting",
  icon: DollarSign,
  children: [{
    title: "Invoices",
    href: "/finance/invoices"
  }, {
    title: "Payments",
    href: "/finance/payments"
  }, {
    title: "P&L Reports",
    href: "/finance/reports"
  }]
}, {
  title: "Customers",
  icon: Users,
  href: "/customers"
}, {
  title: "Reports",
  icon: BarChart3,
  href: "/reports"
}];

const DEPT_LABELS: Record<string, string> = {
  operations: "Operations",
  documentation: "Documentation",
  accounts: "Accounts",
  marketing: "Marketing",
  customer_service: "Customer Service",
  warehouse: "Warehouse",
  management: "Management",
  super_admin: "Super Admin",
};

export function AppSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Operations", "Customs & Ports"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, roles, signOut, isAdmin, department } = useAuth();

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };
  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children: { href: string }[]) => children.some(child => location.pathname === child.href);

  // Filter nav based on department
  const filteredNav = filterNavItems(department, navigation);

  // Build bottom nav dynamically
  const bottomNav: NavItem[] = [
    { title: "Software Guide", icon: BookOpen, href: "/presentation" },
    ...(isAdmin ? [{ title: "User Management", icon: Shield, href: "/admin/users" }] : []),
    { title: "Notifications", icon: Bell, href: "/notifications" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 3)
    : "??";

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col", isCollapsed ? "w-16" : "w-64")}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img src={logo} alt="SLAC Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-sm font-semibold text-primary-foreground bg-primary px-2 py-0.5 rounded">ShippersLink 360</h1>
              <p className="text-xs text-sidebar-muted">Logistics Management</p>
            </div>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors">
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Department Badge */}
      {!isCollapsed && profile && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <Badge variant="secondary" className="text-xs capitalize bg-sidebar-accent text-sidebar-accent-foreground">
            {DEPT_LABELS[profile.department] || profile.department}
          </Badge>
          {profile.last_login_at && (
            <p className="text-[10px] text-sidebar-muted mt-1">
              Last login: {new Date(profile.last_login_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNav.map(item => (
            <li key={item.title}>
              {item.href ? (
                <NavLink to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", isActive(item.href) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              ) : (
                <>
                  <button onClick={() => toggleExpand(item.title)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", item.children && isChildActive(item.children) ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {expandedItems.includes(item.title) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.title) && item.children && (
                    <ul className="mt-1 space-y-1 pl-10">
                      {item.children.map(child => (
                        <li key={child.href}>
                          <NavLink to={child.href} className={cn("block rounded-lg px-3 py-2 text-sm transition-all", isActive(child.href) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                            {child.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-sidebar-border p-3">
        <ul className="space-y-1">
          {bottomNav.map(item => (
            <li key={item.title}>
              <NavLink to={item.href!} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", isActive(item.href!) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("mt-4 flex items-center gap-3 rounded-lg bg-sidebar-accent p-3 w-full hover:bg-sidebar-accent/80 transition-colors text-left", isCollapsed && "justify-center")}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-sm flex-shrink-0">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile?.full_name || "Loading..."}
                  </p>
                  <p className="text-xs text-sidebar-muted truncate capitalize">
                    {DEPT_LABELS[profile?.department || ""] || "Staff"}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 bg-popover">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Sliders className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
