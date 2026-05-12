import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const fmt = (n: number) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

function exportCsv(name: string, rows: (string | number)[][]) {
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function AccountsReports() {
  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger_all"],
    queryFn: async () => {
      const { data } = await supabase.from("ledger_entries" as any).select("*").limit(5000);
      return (data as any[]) ?? [];
    },
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["coa_all"],
    queryFn: async () => {
      const { data } = await supabase.from("chart_of_accounts" as any).select("*");
      return (data as any[]) ?? [];
    },
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices_all"],
    queryFn: async () => {
      const { data } = await supabase.from("finance_invoices").select("*");
      return data ?? [];
    },
  });
  const { data: vouchers = [] } = useQuery({
    queryKey: ["vouchers_all"],
    queryFn: async () => {
      const { data } = await supabase.from("vouchers" as any).select("*").order("voucher_date", { ascending: false }).limit(2000);
      return (data as any[]) ?? [];
    },
  });

  const accMap = new Map(accounts.map((a) => [a.id, a]));

  // P&L
  const incomeAccs = accounts.filter((a) => a.type === "income");
  const expenseAccs = accounts.filter((a) => a.type === "expense");
  const sumByAccount = (id: string) => ledger.filter((l) => l.account_id === id).reduce((s, l) => s + Number(l.ghs_equivalent || 0) * (l.credit > 0 ? 1 : -1), 0);
  const totalIncome = incomeAccs.reduce((s, a) => s + sumByAccount(a.id), 0);
  const totalExpense = expenseAccs.reduce((s, a) => s - sumByAccount(a.id), 0);
  const netProfit = totalIncome - totalExpense;

  // Cash Flow (cash & bank accounts)
  const cashAccs = accounts.filter((a) => a.type === "asset" && (a.code.startsWith("10")));
  const cashFlow = cashAccs.map((a) => ({ account: `${a.code} ${a.name}`, net: ledger.filter((l) => l.account_id === a.id).reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0) }));

  // AR Aging
  const today = new Date();
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0 };
  invoices.forEach((i: any) => {
    if (i.status === "paid" || i.status === "cancelled") return;
    const out = Number(i.total_amount) - Number(i.paid_amount || 0);
    if (out <= 0) return;
    const days = Math.floor((today.getTime() - new Date(i.due_date).getTime()) / 86400000);
    if (days <= 0) buckets.current += out;
    else if (days <= 30) buckets.d30 += out;
    else if (days <= 60) buckets.d60 += out;
    else buckets.d90 += out;
  });

  // Job profitability
  const jobs = new Map<string, { rev: number; exp: number }>();
  ledger.forEach((l) => {
    if (!l.consignment_id) return;
    const a = accMap.get(l.account_id) as any;
    const cur = jobs.get(l.consignment_id) ?? { rev: 0, exp: 0 };
    if (a?.type === "income") cur.rev += Number(l.ghs_equivalent || 0) * (l.credit > 0 ? 1 : -1);
    if (a?.type === "expense") cur.exp += Number(l.ghs_equivalent || 0) * (l.debit > 0 ? 1 : -1);
    jobs.set(l.consignment_id, cur);
  });
  const jobRows = [...jobs.entries()].map(([id, v]) => ({ id, ...v, profit: v.rev - v.exp }));

  return (
    <Tabs defaultValue="pl">
      <TabsList>
        <TabsTrigger value="pl">P&L</TabsTrigger>
        <TabsTrigger value="cash">Cash Flow</TabsTrigger>
        <TabsTrigger value="ar">AR Aging</TabsTrigger>
        <TabsTrigger value="register">Voucher Register</TabsTrigger>
        <TabsTrigger value="jobs">Job Profitability</TabsTrigger>
      </TabsList>

      <TabsContent value="pl">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Profit &amp; Loss</h3>
            <Button size="sm" variant="outline" onClick={() => exportCsv("pl", [["Account","Type","Amount"], ...incomeAccs.map(a => [a.name, "Income", fmt(sumByAccount(a.id))]), ...expenseAccs.map(a => [a.name, "Expense", fmt(-sumByAccount(a.id))])])}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-success">Income</h4>
              <table className="w-full text-sm">{incomeAccs.map((a) => <tr key={a.id} className="border-b"><td className="py-1.5">{a.name}</td><td className="py-1.5 text-right">{fmt(sumByAccount(a.id))}</td></tr>)}<tr className="font-bold"><td className="py-2">Total Income</td><td className="py-2 text-right">{fmt(totalIncome)}</td></tr></table>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-destructive">Expenses</h4>
              <table className="w-full text-sm">{expenseAccs.map((a) => <tr key={a.id} className="border-b"><td className="py-1.5">{a.name}</td><td className="py-1.5 text-right">{fmt(-sumByAccount(a.id))}</td></tr>)}<tr className="font-bold"><td className="py-2">Total Expenses</td><td className="py-2 text-right">{fmt(totalExpense)}</td></tr></table>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t flex justify-between text-lg font-bold">
            <span>Net Profit</span><span className={netProfit >= 0 ? "text-success" : "text-destructive"}>GHS {fmt(netProfit)}</span>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="cash">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Cash Flow by Account</h3>
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr className="text-left"><th className="p-2">Account</th><th className="p-2 text-right">Net Movement (GHS)</th></tr></thead>
            <tbody>{cashFlow.map((r, i) => <tr key={i} className="border-t"><td className="p-2">{r.account}</td><td className="p-2 text-right font-medium">{fmt(r.net)}</td></tr>)}</tbody>
          </table>
        </Card>
      </TabsContent>

      <TabsContent value="ar">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Accounts Receivable Aging</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Bucket label="Current" value={buckets.current} />
            <Bucket label="1-30 days" value={buckets.d30} />
            <Bucket label="31-60 days" value={buckets.d60} />
            <Bucket label="60+ days" value={buckets.d90} variant="danger" />
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Voucher Register</h3>
            <Button size="sm" variant="outline" onClick={() => exportCsv("vouchers", [["No","Type","Date","Payee","Amount","Status"], ...vouchers.map((v) => [v.voucher_no, v.voucher_type, v.voucher_date, v.party_name ?? "", v.total_amount, v.status])])}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-2">No.</th><th className="p-2">Type</th><th className="p-2">Date</th><th className="p-2">Party</th><th className="p-2 text-right">Amount</th><th className="p-2">Status</th></tr></thead>
              <tbody>{vouchers.map((v) => <tr key={v.id} className="border-t"><td className="p-2 font-mono">{v.voucher_no}</td><td className="p-2 capitalize">{v.voucher_type}</td><td className="p-2">{v.voucher_date}</td><td className="p-2">{v.party_name ?? "—"}</td><td className="p-2 text-right">{v.currency} {fmt(v.total_amount)}</td><td className="p-2">{v.status}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="jobs">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Job Profitability</h3>
            <Button size="sm" variant="outline" onClick={() => exportCsv("jobs", [["Consignment","Revenue","Expenses","Profit"], ...jobRows.map((j) => [j.id, fmt(j.rev), fmt(j.exp), fmt(j.profit)])])}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-2">Consignment</th><th className="p-2 text-right">Revenue</th><th className="p-2 text-right">Expenses</th><th className="p-2 text-right">Profit</th></tr></thead>
            <tbody>{jobRows.map((j) => <tr key={j.id} className="border-t"><td className="p-2 font-mono text-xs">{j.id.slice(0, 8)}</td><td className="p-2 text-right">{fmt(j.rev)}</td><td className="p-2 text-right">{fmt(j.exp)}</td><td className={`p-2 text-right font-semibold ${j.profit >= 0 ? "text-success" : "text-destructive"}`}>{fmt(j.profit)}</td></tr>)}</tbody>
          </table>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Bucket({ label, value, variant }: { label: string; value: number; variant?: "danger" }) {
  return (
    <Card className={`p-4 ${variant === "danger" ? "border-destructive/40" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${variant === "danger" ? "text-destructive" : ""}`}>GHS {fmt(value)}</p>
    </Card>
  );
}
