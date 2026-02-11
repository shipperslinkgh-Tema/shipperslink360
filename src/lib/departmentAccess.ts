// Maps departments to the sidebar menu items they can access
type Department = "operations" | "documentation" | "accounts" | "marketing" | "customer_service" | "warehouse" | "management" | "super_admin";

// Paths each department can access
const departmentPaths: Record<Department, string[]> = {
  super_admin: ["*"], // all access
  management: ["*"], // all access
  operations: [
    "/", "/shipments", "/shipments/sea", "/shipments/air", "/consolidation",
    "/customs/icums", "/shipping-lines", "/customs/gpha",
    "/trucking", "/warehouse", "/customers",
  ],
  documentation: [
    "/", "/shipments", "/shipments/sea", "/shipments/air",
    "/customs/icums", "/shipping-lines", "/customs/gpha",
  ],
  accounts: [
    "/", "/finance", "/finance/invoices", "/finance/payments", "/finance/reports",
    "/customers",
  ],
  marketing: [
    "/", "/customers", "/reports",
  ],
  customer_service: [
    "/", "/shipments", "/shipments/sea", "/shipments/air",
    "/customers", "/customs/icums",
  ],
  warehouse: [
    "/", "/warehouse", "/trucking",
    "/shipments", "/consolidation",
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

export function canAccessPath(department: Department | null, path: string): boolean {
  if (!department) return false;
  const allowed = departmentPaths[department];
  if (allowed.includes("*")) return true;
  return allowed.some(p => path === p || path.startsWith(p + "/"));
}

export function filterNavItems(department: Department | null, items: any[]): any[] {
  if (!department) return [];
  const allowed = departmentPaths[department];
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
