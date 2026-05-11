import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DepartmentStats {
  // shared
  activeShipments: number;
  pendingClearance: number;
  // documentation
  pendingDocs: number;
  customsDeclared: number;
  // accounts
  invoicesTotal: number;
  invoicesUnpaid: number;
  totalRevenue: number;
  totalExpenses: number;
  outstanding: number;
  // fleet
  activeTrips: number;
  availableDrivers: number;
  trucksTotal: number;
  // marketing
  totalCustomers: number;
  newCustomers30d: number;
  // admin
  activeUsers: number;
  loading: boolean;
}

const empty: DepartmentStats = {
  activeShipments: 0, pendingClearance: 0,
  pendingDocs: 0, customsDeclared: 0,
  invoicesTotal: 0, invoicesUnpaid: 0, totalRevenue: 0, totalExpenses: 0, outstanding: 0,
  activeTrips: 0, availableDrivers: 0, trucksTotal: 0,
  totalCustomers: 0, newCustomers30d: 0,
  activeUsers: 0,
  loading: true,
};

export function useDepartmentStats() {
  const [stats, setStats] = useState<DepartmentStats>(empty);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();

      const [
        wfActive, wfPending, wfDocsPending, wfCustomsDone,
        invAll, invUnpaid, invPaid,
        expAll,
        drivers, trucks,
        customers, customersNew,
        users,
      ] = await Promise.all([
        supabase.from("consignment_workflows").select("id", { count: "exact", head: true })
          .not("current_stage", "in", "(delivery_completed,cancelled)"),
        supabase.from("consignment_workflows").select("id", { count: "exact", head: true })
          .in("current_stage", ["customs_declared", "duty_paid", "port_processing"]),
        supabase.from("consignment_workflows").select("id", { count: "exact", head: true })
          .in("current_stage", ["documents_received", "documentation_started"]),
        supabase.from("consignment_workflows").select("id", { count: "exact", head: true })
          .not("customs_declared_at", "is", null),
        supabase.from("finance_invoices").select("id, total_amount, ghs_equivalent, status"),
        supabase.from("finance_invoices").select("id", { count: "exact", head: true })
          .in("status", ["sent", "overdue", "draft"]),
        supabase.from("finance_invoices").select("ghs_equivalent").eq("status", "paid"),
        supabase.from("finance_expenses").select("ghs_equivalent"),
        supabase.from("drivers").select("id, status"),
        supabase.from("trucks" as any).select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const totalRevenue = (invPaid.data || []).reduce((s: number, r: any) => s + Number(r.ghs_equivalent || 0), 0);
      const totalExpenses = (expAll.data || []).reduce((s: number, r: any) => s + Number(r.ghs_equivalent || 0), 0);
      const outstanding = (invAll.data || [])
        .filter((r: any) => r.status !== "paid" && r.status !== "cancelled")
        .reduce((s: number, r: any) => s + Number(r.ghs_equivalent || r.total_amount || 0), 0);

      const driverList = (drivers.data || []) as any[];
      const availableDrivers = driverList.filter(d => d.status === "available").length;

      if (!mounted) return;
      setStats({
        activeShipments: wfActive.count ?? 0,
        pendingClearance: wfPending.count ?? 0,
        pendingDocs: wfDocsPending.count ?? 0,
        customsDeclared: wfCustomsDone.count ?? 0,
        invoicesTotal: (invAll.data || []).length,
        invoicesUnpaid: invUnpaid.count ?? 0,
        totalRevenue,
        totalExpenses,
        outstanding,
        activeTrips: 0, // populated below if table exists
        availableDrivers,
        trucksTotal: trucks.count ?? 0,
        totalCustomers: customers.count ?? 0,
        newCustomers30d: customersNew.count ?? 0,
        activeUsers: users.count ?? 0,
        loading: false,
      });

      // Attempt active trips (table may vary)
      const trips = await supabase.from("trucking_jobs" as any).select("id", { count: "exact", head: true })
        .in("status", ["in_transit", "assigned", "loading"]);
      if (mounted && trips.count != null) {
        setStats(s => ({ ...s, activeTrips: trips.count ?? 0 }));
      }
    })();
    return () => { mounted = false; };
  }, []);

  return stats;
}
