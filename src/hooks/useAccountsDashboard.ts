import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAccountsDashboard() {
  return useQuery({
    queryKey: ["accounts_dashboard"],
    queryFn: async () => {
      const [invoices, ledger, banks] = await Promise.all([
        supabase.from("finance_invoices").select("total_amount, paid_amount, status, ghs_equivalent, due_date"),
        supabase.from("ledger_entries" as any).select("debit, credit, ghs_equivalent, account_id, consignment_id"),
        supabase.from("bank_connections").select("balance, currency, is_active"),
      ]);

      const inv = invoices.data ?? [];
      const led = (ledger.data as any[]) ?? [];

      // Pull account types to classify
      const { data: accs } = await supabase.from("chart_of_accounts" as any).select("id, type");
      const typeById = new Map<string, string>();
      (accs as any[] ?? []).forEach((a) => typeById.set(a.id, a.type));

      let revenue = 0, expenses = 0, cash = 0;
      const profitByJob = new Map<string, number>();
      for (const e of led) {
        const t = typeById.get(e.account_id);
        const amount = Number(e.ghs_equivalent || 0);
        if (t === "income") revenue += Number(e.credit ? amount : -amount);
        if (t === "expense") expenses += Number(e.debit ? amount : -amount);
        if (e.consignment_id) {
          const cur = profitByJob.get(e.consignment_id) ?? 0;
          if (t === "income") profitByJob.set(e.consignment_id, cur + Number(e.credit ? amount : -amount));
          if (t === "expense") profitByJob.set(e.consignment_id, cur - Number(e.debit ? amount : -amount));
        }
      }
      const outstanding = inv.reduce((s, i: any) => {
        const out = Number(i.total_amount || 0) - Number(i.paid_amount || 0);
        return s + (i.status !== "paid" && i.status !== "cancelled" ? Math.max(0, out) : 0);
      }, 0);
      const cashBalance = (banks.data ?? []).reduce((s, b: any) => s + Number(b.balance || 0), 0);

      const topJobs = [...profitByJob.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, profit]) => ({ id, profit }));

      return { revenue, expenses, outstanding, cashBalance, profit: revenue - expenses, topJobs, invoiceCount: inv.length };
    },
  });
}
