import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";
import { useLedger } from "@/hooks/useLedger";

export default function AccountsLedgers() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("general");
  const [accountId, setAccountId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: accounts = [] } = useChartOfAccounts();
  const { data: entries = [], isLoading } = useLedger({
    accountId: tab === "general" ? accountId : undefined,
    customerId: tab !== "general" ? (customerId || undefined) : undefined,
    from: from || undefined,
    to: to || undefined,
  });

  let running = 0;
  const rows = entries.map((e) => {
    running += Number(e.ghs_equivalent) * (e.debit > 0 ? 1 : -1);
    return { ...e, running };
  });

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General Ledger</TabsTrigger>
          <TabsTrigger value="customer">Customer Ledger</TabsTrigger>
          <TabsTrigger value="supplier">Supplier Ledger</TabsTrigger>
        </TabsList>

        <Card className="p-4 mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {tab === "general" ? (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-72"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder={`${tab === "customer" ? "Customer" : "Supplier"} code/ID`} value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="max-w-xs" />
            )}
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Debit</th>
                  <th className="p-2 text-right">Credit</th>
                  <th className="p-2 text-right">Balance (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
                {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Select a filter to view ledger.</td></tr>}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.entry_date}</td>
                    <td className="p-2">{r.description ?? "—"}</td>
                    <td className="p-2 text-right">{r.debit ? Number(r.debit).toLocaleString() : ""}</td>
                    <td className="p-2 text-right">{r.credit ? Number(r.credit).toLocaleString() : ""}</td>
                    <td className="p-2 text-right font-medium">{r.running.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Tabs>
    </div>
  );
}
