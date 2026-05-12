import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, FileText, Receipt, BookOpen, Wallet, BarChart3, Lock, FolderArchive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";

const links = [
  { to: "/accounts", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/accounts/invoices", label: "Invoices", icon: FileText },
  { to: "/accounts/vouchers", label: "Vouchers", icon: Receipt },
  { to: "/accounts/expenses", label: "Expenses", icon: Wallet },
  { to: "/accounts/ledgers", label: "Ledgers", icon: BookOpen },
  { to: "/accounts/documents", label: "Documents", icon: FolderArchive },
  { to: "/accounts/reports", label: "Reports", icon: BarChart3 },
];

export default function AccountsLayout() {
  const { canView, canEdit } = useAccountsAccess();
  const location = useLocation();

  if (!canView) return <Navigate to="/" replace />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts Portal</h1>
          <p className="text-sm text-muted-foreground">Voucher-based double-entry accounting linked to consignments</p>
        </div>
        {!canEdit && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
            <Lock className="h-3.5 w-3.5" /> Read-only access
          </div>
        )}
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b">
        {links.map((l) => {
          const active = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
