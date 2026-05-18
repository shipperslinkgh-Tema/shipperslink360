import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Info, Download, ArrowLeft, BookOpen, ChevronDown, Receipt, FileText, BookOpenCheck, Repeat } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";
import { useLedger } from "@/hooks/useLedger";
import { useCustomers } from "@/hooks/useCustomers";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE_COLOR: Record<string, string> = {
  asset: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  liability: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  equity: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  income: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  expense: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function AccountsLedgers() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("general");
  const [accountId, setAccountId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: accounts = [] } = useChartOfAccounts();
  const { data: customers = [] } = useCustomers();

  // All entries (for summary)
  const { data: allEntries = [] } = useLedger({
    from: from || undefined,
    to: to || undefined,
  });

  // Filtered entries (for selected drilldown)
  const { data: entries = [], isLoading } = useLedger({
    accountId: tab === "general" ? (accountId || undefined) : undefined,
    customerId: tab !== "general" ? (customerId || undefined) : undefined,
    from: from || undefined,
    to: to || undefined,
  });

  // Build per-account summary balances
  const accountSummary = useMemo(() => {
    const map = new Map<string, { debit: number; credit: number; count: number }>();
    for (const e of allEntries) {
      const cur = map.get(e.account_id) || { debit: 0, credit: 0, count: 0 };
      cur.debit += Number(e.debit) || 0;
      cur.credit += Number(e.credit) || 0;
      cur.count += 1;
      map.set(e.account_id, cur);
    }
    return accounts
      .map((a) => {
        const m = map.get(a.id) || { debit: 0, credit: 0, count: 0 };
        return { ...a, debit: m.debit, credit: m.credit, count: m.count, balance: m.debit - m.credit };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [allEntries, accounts]);

  const totals = useMemo(() => {
    return allEntries.reduce(
      (acc, e) => {
        acc.debit += Number(e.debit) || 0;
        acc.credit += Number(e.credit) || 0;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [allEntries]);

  // Running balance for drilldown
  let running = 0;
  const rows = entries.map((e) => {
    running += (Number(e.debit) || 0) - (Number(e.credit) || 0);
    return { ...e, running };
  });

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleExport = () => {
    const header = ["Date", "Account", "Description", "Debit", "Credit", "Balance (GHS)"];
    const lines = [header.join(",")];
    rows.forEach((r) => {
      const acc = accounts.find((a) => a.id === r.account_id);
      lines.push([
        r.entry_date,
        `"${acc ? `${acc.code} ${acc.name}` : ""}"`,
        `"${(r.description ?? "").replace(/"/g, '""')}"`,
        r.debit || "",
        r.credit || "",
        r.running.toFixed(2),
      ].join(","));
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showingDrilldown = (tab === "general" && accountId) || (tab !== "general" && customerId);

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/40 p-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Ledgers are auto-generated from <strong>posted vouchers</strong>. To add entries, create and post a voucher
            (Payment, Receipt, Journal or Contra) — its balanced debit/credit lines will appear here.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/accounts/books?tab=vouchers")} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Voucher
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setAccountId(""); setCustomerId(""); }}>
        <TabsList>
          <TabsTrigger value="general">General Ledger</TabsTrigger>
          <TabsTrigger value="customer">Customer Ledger</TabsTrigger>
          <TabsTrigger value="supplier">Supplier Ledger</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-4 mt-4">
          <div className="flex flex-wrap items-end gap-2">
            {tab === "general" ? (
              <div className="flex-1 min-w-[260px]">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Account</label>
                <Select value={accountId || "all"} onValueChange={(v) => setAccountId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="All accounts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All accounts (summary)</SelectItem>
                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex-1 min-w-[260px]">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {tab === "customer" ? "Customer" : "Supplier"}
                </label>
                <Select value={customerId || "all"} onValueChange={(v) => setCustomerId(v === "all" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All parties (summary)</SelectItem>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.customerCode ? `${c.customerCode} — ` : ""}{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
            </div>
            {showingDrilldown && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>
        </Card>

        {/* Body */}
        {!showingDrilldown ? (
          // Summary view: list all accounts with balances
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" /> Chart of Accounts — Balance Summary</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {allEntries.length} ledger entries · Total Dr {totals.debit.toLocaleString()} · Cr {totals.credit.toLocaleString()} GHS
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2 px-4">Code</th>
                    <th className="p-2">Account</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-right">Entries</th>
                    <th className="p-2 text-right">Debit</th>
                    <th className="p-2 text-right">Credit</th>
                    <th className="p-2 text-right pr-4">Balance (GHS)</th>
                  </tr>
                </thead>
                <tbody>
                  {tab === "general" ? (
                    accountSummary.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No accounts available.</td></tr>
                    ) : (
                      accountSummary.map((a) => (
                        <tr
                          key={a.id}
                          className={cn(
                            "border-t transition-colors",
                            a.count > 0 ? "cursor-pointer hover:bg-muted/50" : "opacity-60"
                          )}
                          onClick={() => a.count > 0 && setAccountId(a.id)}
                        >
                          <td className="p-2 px-4 font-mono text-xs">{a.code}</td>
                          <td className="p-2 font-medium">{a.name}</td>
                          <td className="p-2">
                            <Badge variant="secondary" className={cn("capitalize text-[10px]", ACCOUNT_TYPE_COLOR[a.type])}>{a.type}</Badge>
                          </td>
                          <td className="p-2 text-right text-muted-foreground">{a.count}</td>
                          <td className="p-2 text-right">{a.debit ? a.debit.toLocaleString() : "—"}</td>
                          <td className="p-2 text-right">{a.credit ? a.credit.toLocaleString() : "—"}</td>
                          <td className={cn("p-2 pr-4 text-right font-semibold", a.balance < 0 && "text-rose-600 dark:text-rose-400")}>
                            {a.balance ? a.balance.toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Select a {tab === "customer" ? "customer" : "supplier"} above to view their ledger.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          // Drilldown view: transactions for selected account/party
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => { setAccountId(""); setCustomerId(""); }} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div>
                  <h3 className="font-semibold">
                    {selectedAccount ? `${selectedAccount.code} — ${selectedAccount.name}` : (selectedCustomer as any)?.companyName || "Ledger"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rows.length} entries · Closing balance: <strong>{running.toLocaleString()} GHS</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2 px-4">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Debit</th>
                    <th className="p-2 text-right">Credit</th>
                    <th className="p-2 text-right pr-4">Balance (GHS)</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
                  {!isLoading && rows.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No entries for this selection. Post a voucher referencing this {selectedAccount ? "account" : "party"} to see entries here.
                    </td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2 px-4 whitespace-nowrap">{r.entry_date}</td>
                      <td className="p-2">{r.description ?? "—"}</td>
                      <td className="p-2 text-right">{r.debit ? Number(r.debit).toLocaleString() : ""}</td>
                      <td className="p-2 text-right">{r.credit ? Number(r.credit).toLocaleString() : ""}</td>
                      <td className="p-2 pr-4 text-right font-medium">{r.running.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
