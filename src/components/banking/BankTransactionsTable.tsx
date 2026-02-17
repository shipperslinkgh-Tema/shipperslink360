import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function BankTransactionsTable() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["bank-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*, bank_connections(bank_display_name, bank_name)")
        .order("transaction_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = !search || 
        txn.description?.toLowerCase().includes(search.toLowerCase()) ||
        txn.counterparty_name?.toLowerCase().includes(search.toLowerCase()) ||
        txn.transaction_ref.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || txn.transaction_type === typeFilter;
      const matchesMatch = matchFilter === "all" || txn.match_status === matchFilter;
      return matchesSearch && matchesType && matchesMatch;
    });
  }, [transactions, search, typeFilter, matchFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bank Transactions
          <Badge variant="secondary">{filtered.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
            </SelectContent>
          </Select>
          <Select value={matchFilter} onValueChange={setMatchFilter}>
            <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Match" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="auto_matched">Auto-Matched</SelectItem>
              <SelectItem value="manually_matched">Manually Matched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Loading transactions...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No transactions found. Transactions will appear here when banks are synced or webhooks are received.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      {txn.transaction_type === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{(txn as any).bank_connections?.bank_display_name || "—"}</TableCell>
                    <TableCell className="text-sm font-mono">{txn.transaction_ref}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{txn.description || "—"}</TableCell>
                    <TableCell className="text-sm">{txn.counterparty_name || "—"}</TableCell>
                    <TableCell className={cn("text-right font-semibold text-sm", txn.transaction_type === "credit" ? "text-emerald-600" : "text-destructive")}>
                      {txn.transaction_type === "credit" ? "+" : "-"}{txn.currency} {Number(txn.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(txn.transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={txn.match_status === "unmatched" ? "destructive" : txn.match_status === "auto_matched" ? "default" : "secondary"} className="text-xs">
                        {txn.match_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
