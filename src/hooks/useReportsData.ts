import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, startOfQuarter, startOfYear, subMonths, format, parseISO, differenceInDays } from "date-fns";

export type DateRange = "mtd" | "qtd" | "ytd" | "last6m";

function getDateStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "mtd": return startOfMonth(now);
    case "qtd": return startOfQuarter(now);
    case "ytd": return startOfYear(now);
    case "last6m": return subMonths(now, 6);
  }
}

// ── Revenue & Expense aggregation by month ──
export function useMonthlyFinancials() {
  return useQuery({
    queryKey: ["reports-monthly-financials"],
    queryFn: async () => {
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");

      const [invoicesRes, expensesRes] = await Promise.all([
        supabase.from("finance_invoices").select("total_amount, status, issue_date, currency, ghs_equivalent").gte("issue_date", sixMonthsAgo),
        supabase.from("finance_expenses").select("ghs_equivalent, status, expense_date").gte("expense_date", sixMonthsAgo),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (expensesRes.error) throw expensesRes.error;

      const monthlyMap: Record<string, { revenue: number; expenses: number; profit: number }> = {};

      for (const inv of invoicesRes.data || []) {
        const month = format(parseISO(inv.issue_date), "MMM yyyy");
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0, profit: 0 };
        if (inv.status === "paid") {
          monthlyMap[month].revenue += Number(inv.ghs_equivalent) || Number(inv.total_amount) || 0;
        }
      }

      for (const exp of expensesRes.data || []) {
        const month = format(parseISO(exp.expense_date), "MMM yyyy");
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0, profit: 0 };
        if (exp.status === "approved" || exp.status === "paid") {
          monthlyMap[month].expenses += Number(exp.ghs_equivalent) || 0;
        }
      }

      // Calculate profit
      Object.values(monthlyMap).forEach(m => { m.profit = m.revenue - m.expenses; });

      // Sort by date, return last 6
      const months = Object.entries(monthlyMap)
        .map(([month, data]) => ({ month: month.split(" ")[0], ...data }))
        .slice(-6);

      return months;
    },
    staleTime: 60000,
  });
}

// ── Consignment / Operations stats ──
export function useOperationsStats() {
  return useQuery({
    queryKey: ["reports-operations-stats"],
    queryFn: async () => {
      const { data: workflows, error } = await supabase
        .from("consignment_workflows")
        .select("id, consignment_ref, client_name, shipment_type, current_stage, eta, vessel_name, container_number, bl_number, awb_number, assigned_officer, created_at, stage_started_at, origin_country, port_of_discharge, customs_declared_at, cargo_released_at, delivery_completed_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const all = workflows || [];
      const stageMap: Record<string, string> = {
        document_reception: "Pending",
        documentation: "Pending",
        customs_declaration: "Customs",
        duty_payment: "Customs",
        port_processing: "At Port",
        cargo_release: "At Port",
        truck_assignment: "In Transit",
        delivery_in_transit: "In Transit",
        delivery_completed: "Delivered",
      };

      const statusCounts: Record<string, number> = { "In Transit": 0, "At Port": 0, "Customs": 0, "Delivered": 0, "Pending": 0 };
      const typeCounts: Record<string, number> = { sea: 0, air: 0, road: 0 };

      const rows = all.map(wf => {
        const status = stageMap[wf.current_stage] || "Pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        const type = wf.shipment_type?.toLowerCase().includes("air") ? "air"
          : wf.shipment_type?.toLowerCase().includes("road") ? "road" : "sea";
        typeCounts[type] = (typeCounts[type] || 0) + 1;

        const daysToClose = wf.delivery_completed_at && wf.created_at
          ? differenceInDays(parseISO(wf.delivery_completed_at), parseISO(wf.created_at))
          : null;

        return {
          bl: wf.bl_number || wf.awb_number || wf.consignment_ref,
          customer: wf.client_name,
          type: type === "air" ? "Air" : type === "road" ? "Road" : "Sea",
          status,
          origin: wf.origin_country || "—",
          destination: wf.port_of_discharge || "Tema",
          eta: wf.eta ? format(parseISO(wf.eta), "MMM dd, yyyy") : "—",
          clearance: wf.cargo_released_at ? format(parseISO(wf.cargo_released_at), "MMM dd, yyyy") : "—",
          daysToClose,
          officer: wf.assigned_officer || "Unassigned",
        };
      });

      // Avg clearance speed (only completed)
      const completed = all.filter(w => w.customs_declared_at && w.cargo_released_at);
      const avgClearanceDays = completed.length > 0
        ? completed.reduce((s, w) => s + differenceInDays(parseISO(w.cargo_released_at!), parseISO(w.customs_declared_at!)), 0) / completed.length
        : 0;

      // Shipment volume by type per month (last 6 months)
      const sixMonthsAgo = subMonths(new Date(), 6);
      const volumeByMonth: Record<string, { sea: number; air: number; road: number }> = {};
      all.filter(w => parseISO(w.created_at) >= sixMonthsAgo).forEach(wf => {
        const month = format(parseISO(wf.created_at), "MMM");
        if (!volumeByMonth[month]) volumeByMonth[month] = { sea: 0, air: 0, road: 0 };
        const type = wf.shipment_type?.toLowerCase().includes("air") ? "air"
          : wf.shipment_type?.toLowerCase().includes("road") ? "road" : "sea";
        volumeByMonth[month][type]++;
      });

      return {
        total: all.length,
        delivered: statusCounts["Delivered"],
        inProgress: statusCounts["In Transit"] + statusCounts["At Port"] + statusCounts["Customs"],
        delayed: all.filter(w => w.eta && parseISO(w.eta) < new Date() && w.current_stage !== "delivery_completed").length,
        statusCounts,
        typeCounts,
        rows,
        avgClearanceDays: Math.round(avgClearanceDays * 10) / 10,
        volumeByMonth: Object.entries(volumeByMonth).map(([month, d]) => ({ month, ...d })),
      };
    },
    staleTime: 60000,
  });
}

// ── Finance summary stats ──
export function useFinanceSummary() {
  return useQuery({
    queryKey: ["reports-finance-summary"],
    queryFn: async () => {
      const [invoicesRes, expensesRes, payablesRes, receivablesRes] = await Promise.all([
        supabase.from("finance_invoices").select("total_amount, ghs_equivalent, status, paid_amount"),
        supabase.from("finance_expenses").select("ghs_equivalent, status"),
        supabase.from("finance_payables").select("ghs_equivalent, status"),
        supabase.from("finance_receivables").select("outstanding_amount, ghs_equivalent, status, aging_bucket"),
      ]);

      const invoices = invoicesRes.data || [];
      const expenses = expensesRes.data || [];
      const payables = payablesRes.data || [];
      const receivables = receivablesRes.data || [];

      const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (Number(i.ghs_equivalent) || Number(i.total_amount) || 0), 0);
      const totalOutstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (Number(i.ghs_equivalent) || Number(i.total_amount) || 0), 0);
      const totalPayables = payables.filter(p => p.status === "pending").reduce((s, p) => s + (Number(p.ghs_equivalent) || 0), 0);
      const totalExpenses = expenses.filter(e => ["approved", "paid"].includes(e.status)).reduce((s, e) => s + (Number(e.ghs_equivalent) || 0), 0);

      // Aging buckets
      const agingBuckets: Record<string, { count: number; amount: number }> = {
        current: { count: 0, amount: 0 },
        "30_days": { count: 0, amount: 0 },
        "60_days": { count: 0, amount: 0 },
        "90_days": { count: 0, amount: 0 },
        "over_90": { count: 0, amount: 0 },
      };
      receivables.forEach(r => {
        const bucket = r.aging_bucket || "current";
        if (agingBuckets[bucket]) {
          agingBuckets[bucket].count++;
          agingBuckets[bucket].amount += Number(r.outstanding_amount) || 0;
        }
      });

      return {
        totalRevenue,
        totalOutstanding,
        totalPayables,
        totalExpenses,
        netCashPosition: totalRevenue - totalPayables,
        agingBuckets,
        invoiceCount: invoices.length,
        overdueCount: invoices.filter(i => i.status === "overdue").length,
      };
    },
    staleTime: 60000,
  });
}

// ── Client analytics ──
export function useClientAnalytics() {
  return useQuery({
    queryKey: ["reports-client-analytics"],
    queryFn: async () => {
      const [customersRes, invoicesRes] = await Promise.all([
        supabase.from("customers").select("id, company_name, status, outstanding_balance, credit_limit, total_shipments, is_active"),
        supabase.from("finance_invoices").select("customer_id, customer, total_amount, ghs_equivalent, status"),
      ]);

      const customers = customersRes.data || [];
      const invoices = invoicesRes.data || [];

      // Revenue per customer
      const revenueByCustomer: Record<string, number> = {};
      invoices.filter(i => i.status === "paid").forEach(inv => {
        const key = inv.customer_id || inv.customer;
        revenueByCustomer[key] = (revenueByCustomer[key] || 0) + (Number(inv.ghs_equivalent) || Number(inv.total_amount) || 0);
      });

      const clientRows = customers.map(c => ({
        id: c.id,
        client: c.company_name,
        revenue: revenueByCustomer[c.id] || 0,
        shipments: c.total_shipments || 0,
        outstanding: Number(c.outstanding_balance) || 0,
        creditLimit: Number(c.credit_limit) || 0,
        status: c.is_active !== false ? "active" : "inactive",
      })).sort((a, b) => b.revenue - a.revenue);

      const activeCount = customers.filter(c => c.is_active !== false && c.status === "active").length;
      const totalOutstanding = customers.reduce((s, c) => s + (Number(c.outstanding_balance) || 0), 0);
      const totalShipments = customers.reduce((s, c) => s + (c.total_shipments || 0), 0);
      const avgShipments = customers.length > 0 ? Math.round(totalShipments / customers.length) : 0;

      return {
        clientRows,
        activeCount,
        totalCount: customers.length,
        totalOutstanding,
        avgShipments,
      };
    },
    staleTime: 60000,
  });
}

// ── Trucking / delivery stats ──
export function useTruckingStats() {
  return useQuery({
    queryKey: ["reports-trucking-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trucking_trips")
        .select("status, trip_cost, fuel_cost, driver_payment")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const trips = data || [];

      return {
        total: trips.length,
        completed: trips.filter(t => t.status === "delivered").length,
        inProgress: trips.filter(t => ["in_transit", "at_pickup"].includes(t.status)).length,
        scheduled: trips.filter(t => t.status === "scheduled").length,
        totalCost: trips.reduce((s, t) => s + (Number(t.trip_cost) || 0), 0),
        completionRate: trips.length > 0
          ? Math.round((trips.filter(t => t.status === "delivered").length / trips.length) * 100)
          : 0,
      };
    },
    staleTime: 60000,
  });
}
