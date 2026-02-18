import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinanceDashboardMetrics, AgingSummary } from "@/types/finance";
import { startOfMonth, startOfYear, endOfMonth, format } from "date-fns";

interface PLData {
  metrics: FinanceDashboardMetrics;
  agingSummary: AgingSummary;
  revenueByService: { label: string; value: number; color: string }[];
  costBreakdown: { label: string; value: number }[];
  expenseBreakdown: { label: string; value: number; percentage: number }[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

async function fetchPLData(): Promise<Omit<PLData, "isLoading" | "error" | "refetch">> {
  const now = new Date();
  const mtdStart = format(startOfMonth(now), "yyyy-MM-dd");
  const mtdEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const ytdStart = format(startOfYear(now), "yyyy-MM-dd");
  const ytdEnd = format(now, "yyyy-MM-dd");

  // Fetch all data in parallel
  const [
    mtdInvoicesRes,
    ytdInvoicesRes,
    mtdExpensesRes,
    ytdExpensesRes,
    mtdJobCostsRes,
    ytdJobCostsRes,
  ] = await Promise.all([
    supabase
      .from("finance_invoices")
      .select("total_amount, ghs_equivalent, status, service_type, paid_amount, due_date, issue_date")
      .gte("issue_date", mtdStart)
      .lte("issue_date", mtdEnd),
    supabase
      .from("finance_invoices")
      .select("total_amount, ghs_equivalent, status, service_type, paid_amount, due_date, issue_date")
      .gte("issue_date", ytdStart)
      .lte("issue_date", ytdEnd),
    supabase
      .from("finance_expenses")
      .select("ghs_equivalent, category, status")
      .gte("expense_date", mtdStart)
      .lte("expense_date", mtdEnd),
    supabase
      .from("finance_expenses")
      .select("ghs_equivalent, category, status")
      .gte("expense_date", ytdStart)
      .lte("expense_date", ytdEnd),
    supabase
      .from("finance_job_costs")
      .select("ghs_equivalent, cost_category, payment_status")
      .gte("created_at", `${mtdStart}T00:00:00`)
      .lte("created_at", `${mtdEnd}T23:59:59`),
    supabase
      .from("finance_job_costs")
      .select("ghs_equivalent, cost_category, payment_status")
      .gte("created_at", `${ytdStart}T00:00:00`)
      .lte("created_at", `${ytdEnd}T23:59:59`),
  ]);

  const mtdInvoices = mtdInvoicesRes.data ?? [];
  const ytdInvoices = ytdInvoicesRes.data ?? [];
  const mtdExpenses = mtdExpensesRes.data ?? [];
  const ytdExpenses = ytdExpensesRes.data ?? [];
  const mtdJobCosts = mtdJobCostsRes.data ?? [];
  const ytdJobCosts = ytdJobCostsRes.data ?? [];

  // Revenue calculations (non-cancelled, non-draft invoices count as revenue)
  const activeStatuses = ["sent", "partially_paid", "paid", "overdue", "disputed"];
  const mtdRevenue = mtdInvoices
    .filter((i) => activeStatuses.includes(i.status))
    .reduce((sum, i) => sum + Number(i.ghs_equivalent), 0);
  const ytdRevenue = ytdInvoices
    .filter((i) => activeStatuses.includes(i.status))
    .reduce((sum, i) => sum + Number(i.ghs_equivalent), 0);

  // Cost of sales
  const mtdCosts = mtdJobCosts.reduce((sum, c) => sum + Number(c.ghs_equivalent), 0);
  const ytdCosts = ytdJobCosts.reduce((sum, c) => sum + Number(c.ghs_equivalent), 0);

  // Operating expenses
  const mtdOpex = mtdExpenses.reduce((sum, e) => sum + Number(e.ghs_equivalent), 0);
  const ytdOpex = ytdExpenses.reduce((sum, e) => sum + Number(e.ghs_equivalent), 0);

  const mtdProfit = mtdRevenue - mtdCosts;
  const ytdProfit = ytdRevenue - ytdCosts;
  const mtdMargin = mtdRevenue > 0 ? (mtdProfit / mtdRevenue) * 100 : 0;
  const ytdMargin = ytdRevenue > 0 ? (ytdProfit / ytdRevenue) * 100 : 0;

  // Invoice status KPIs
  const allInvoices = [...new Map([...mtdInvoices, ...ytdInvoices].map((i) => [JSON.stringify(i), i])).values()];
  const pendingInvoices = allInvoices.filter((i) => i.status === "sent").length;
  const overdueInvoices = allInvoices.filter((i) => i.status === "overdue").length;

  // Receivables aging (based on overdue invoices)
  const today = new Date();
  const overdueInvList = ytdInvoices.filter(
    (i) => i.status === "overdue" || (i.status === "sent" && new Date(i.due_date) < today)
  );

  let current = 0, days1to30 = 0, days31to60 = 0, days61to90 = 0, days90plus = 0;
  overdueInvList.forEach((inv) => {
    const outstanding = Number(inv.ghs_equivalent) - Number(inv.paid_amount);
    if (outstanding <= 0) return;
    const daysLate = Math.floor(
      (today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLate <= 0) current += outstanding;
    else if (daysLate <= 30) days1to30 += outstanding;
    else if (daysLate <= 60) days31to60 += outstanding;
    else if (daysLate <= 90) days61to90 += outstanding;
    else days90plus += outstanding;
  });

  // Also add current (not yet due, not paid) to current bucket
  ytdInvoices
    .filter((i) => i.status === "sent" && new Date(i.due_date) >= today)
    .forEach((inv) => {
      current += Number(inv.ghs_equivalent) - Number(inv.paid_amount);
    });
  ytdInvoices
    .filter((i) => i.status === "partially_paid")
    .forEach((inv) => {
      const outstanding = Number(inv.ghs_equivalent) - Number(inv.paid_amount);
      if (outstanding > 0) {
        const daysLate = Math.floor(
          (today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLate <= 0) current += outstanding;
        else if (daysLate <= 30) days1to30 += outstanding;
        else days90plus += outstanding;
      }
    });

  const agingSummary: AgingSummary = {
    current,
    days1to30,
    days31to60,
    days61to90,
    days90plus,
    total: current + days1to30 + days31to60 + days61to90 + days90plus,
    customerCount: new Set(overdueInvList.map((i) => (i as any).customer_id)).size,
  };

  // Revenue by service type
  const serviceMap: Record<string, string> = {
    freight_forwarding: "Freight Forwarding",
    customs_clearing: "Customs Clearing",
    trucking: "Trucking",
    warehousing: "Warehousing",
    agency_fee: "Agency Fees",
    other: "Other",
  };
  const serviceColors: Record<string, string> = {
    freight_forwarding: "bg-blue-500",
    customs_clearing: "bg-green-500",
    trucking: "bg-amber-500",
    warehousing: "bg-purple-500",
    agency_fee: "bg-pink-500",
    other: "bg-slate-400",
  };
  const serviceRevMap: Record<string, number> = {};
  mtdInvoices
    .filter((i) => activeStatuses.includes(i.status))
    .forEach((inv) => {
      const svc = inv.service_type || "other";
      serviceRevMap[svc] = (serviceRevMap[svc] || 0) + Number(inv.ghs_equivalent);
    });
  const revenueByService = Object.entries(serviceRevMap).map(([key, value]) => ({
    label: serviceMap[key] || key,
    value,
    color: serviceColors[key] || "bg-slate-400",
  }));

  // Cost breakdown by category
  const costCatMap: Record<string, number> = {};
  mtdJobCosts.forEach((c) => {
    const cat = c.cost_category || "other";
    costCatMap[cat] = (costCatMap[cat] || 0) + Number(c.ghs_equivalent);
  });
  const costLabelMap: Record<string, string> = {
    freight_sea: "Freight Costs (Sea)",
    freight_air: "Freight Costs (Air)",
    gpha_charges: "Port Charges",
    shipping_line_do: "DO Charges",
    trucking: "Trucking",
    customs_duty: "Customs Duty",
    customs_vat: "Customs VAT",
    warehousing: "Warehousing",
    other: "Other",
  };
  const costBreakdown = Object.entries(costCatMap).map(([key, value]) => ({
    label: costLabelMap[key] || key,
    value,
  }));

  // Expense breakdown by category
  const expCatMap: Record<string, number> = {};
  mtdExpenses.forEach((e) => {
    const cat = e.category || "other";
    expCatMap[cat] = (expCatMap[cat] || 0) + Number(e.ghs_equivalent);
  });
  const expTotal = Object.values(expCatMap).reduce((a, b) => a + b, 0) || 1;
  const expLabelMap: Record<string, string> = {
    salaries: "Salaries",
    rent: "Rent & Utilities",
    utilities: "Utilities",
    vehicle: "Vehicle & Fuel",
    admin: "Admin",
    bank_charges: "Bank Charges",
    other: "Other",
  };
  const expenseBreakdown = Object.entries(expCatMap).map(([key, value]) => ({
    label: expLabelMap[key] || key,
    value,
    percentage: Math.round((value / expTotal) * 100),
  }));

  // Cash position from bank_connections
  const bankRes = await supabase
    .from("bank_connections")
    .select("available_balance, currency")
    .eq("is_active", true)
    .eq("currency", "GHS");
  const cashPosition = (bankRes.data ?? []).reduce(
    (sum, b) => sum + Number(b.available_balance ?? 0),
    0
  );

  // DSO calculation (Days Sales Outstanding)
  const totalAR = agingSummary.total;
  const dso = mtdRevenue > 0 ? Math.round((totalAR / (ytdRevenue / 365)) * 10) / 10 : 0;

  const metrics: FinanceDashboardMetrics = {
    mtdRevenue,
    mtdCosts,
    mtdProfit,
    mtdMargin,
    ytdRevenue,
    ytdCosts,
    ytdProfit,
    ytdMargin,
    pendingInvoices,
    overdueInvoices,
    pendingPayables: 0, // could be extended
    overduePayables: 0,
    cashPosition,
    dso,
    dpo: 0,
  };

  return { metrics, agingSummary, revenueByService, costBreakdown, expenseBreakdown };
}

export function usePLData(): PLData {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pl-dashboard"],
    queryFn: fetchPLData,
    staleTime: 1000 * 60 * 5, // 5 minute cache
    refetchOnWindowFocus: false,
  });

  const fallbackMetrics: FinanceDashboardMetrics = {
    mtdRevenue: 0, mtdCosts: 0, mtdProfit: 0, mtdMargin: 0,
    ytdRevenue: 0, ytdCosts: 0, ytdProfit: 0, ytdMargin: 0,
    pendingInvoices: 0, overdueInvoices: 0, pendingPayables: 0, overduePayables: 0,
    cashPosition: 0, dso: 0, dpo: 0,
  };
  const fallbackAging: AgingSummary = {
    current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90plus: 0, total: 0, customerCount: 0,
  };

  return {
    metrics: data?.metrics ?? fallbackMetrics,
    agingSummary: data?.agingSummary ?? fallbackAging,
    revenueByService: data?.revenueByService ?? [],
    costBreakdown: data?.costBreakdown ?? [],
    expenseBreakdown: data?.expenseBreakdown ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
