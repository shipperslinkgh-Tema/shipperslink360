// Maps departments to the sidebar menu items they can access
type Department = "operations" | "documentation" | "accounts" | "marketing" | "customer_service" | "warehouse" | "management" | "super_admin";

// Paths each department can access
const departmentPaths: Record<Department, string[]> = {
  super_admin: ["*"], // all access
  management: ["*"], // all access
  operations: [
    "/", "/consignments", "/shipments", "/shipments/sea", "/shipments/air", "/consolidation",
    "/customs/icums", "/shipping-lines", "/customs/gpha",
    "/trucking", "/live-tracking", "/warehouse", "/customers", "/ai-assistant", "/reports",
  ],
  documentation: [
    "/", "/consignments", "/shipments", "/shipments/sea", "/shipments/air",
    "/customs/icums", "/shipping-lines", "/customs/gpha", "/ai-assistant", "/reports",
  ],
  accounts: [
    "/", "/consignments", "/finance", "/finance/invoices", "/finance/payments", "/finance/reports",
    "/finance/banking", "/accounts",
    "/customers", "/ai-assistant", "/reports",
    "/admin/client-management",
  ],
  marketing: [
    "/", "/customers", "/reports",
  ],
  customer_service: [
    "/", "/consignments", "/shipments", "/shipments/sea", "/shipments/air",
    "/customers", "/customs/icums",
  ],
  warehouse: [
    "/", "/consignments", "/warehouse", "/trucking", "/live-tracking",
    "/shipments", "/consolidation", "/ai-assistant", "/reports",
  ],
};

// Default redirect per department after login
export const departmentRedirect: Record<Department, string> = {
  super_admin: "/",
  management: "/",
  operations: "/shipments",
  documentation: "/shipments",
  accounts: "/finance",
  marketing: "/customers",
  customer_service: "/customers",
  warehouse: "/trucking",
};

type AppRole = "super_admin" | "admin" | "manager" | "staff";

const FINANCE_PATHS = ["/finance", "/finance/invoices", "/finance/payments", "/finance/reports", "/finance/banking", "/accounts"];

function getAllowedPaths(department: Department | null, roles: AppRole[] = []): string[] {
  if (!department) return [];
  const base = [...(departmentPaths[department] || [])];
  // Operations director / manager gets accounting portal access
  if (department === "operations" && roles.includes("manager")) {
    for (const p of FINANCE_PATHS) if (!base.includes(p)) base.push(p);
  }
  return base;
}

export function canAccessPath(department: Department | null, path: string, roles: AppRole[] = []): boolean {
  const allowed = getAllowedPaths(department, roles);
  if (!allowed.length) return false;
  if (allowed.includes("*")) return true;
  return allowed.some(p => path === p || path.startsWith(p + "/"));
}

export function filterNavItems(department: Department | null, items: any[], roles: AppRole[] = []): any[] {
  const allowed = getAllowedPaths(department, roles);
  if (!allowed.length) return [];
  if (allowed.includes("*")) return items;

  return items.filter(item => {
    if (item.href) {
      return allowed.some(p => item.href === p || item.href.startsWith(p + "/") || p.startsWith(item.href + "/"));
    }
    if (item.children) {
      const filteredChildren = item.children.filter((child: any) =>
        allowed.some(p => child.href === p || child.href.startsWith(p + "/"))
      );
      return filteredChildren.length > 0;
    }
    return false;
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter((child: any) =>
          allowed.some(p => child.href === p || child.href.startsWith(p + "/"))
        ),
      };
    }
    return item;
  });
}
