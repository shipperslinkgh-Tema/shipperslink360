import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BankReconciliationPanel() {
  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ["bank-reconciliations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_reconciliations")
        .select("*, bank_connections(bank_display_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>;
      case "approved": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Approved</Badge>;
      case "in_progress": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">In Progress</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Bank Reconciliation
          </CardTitle>
          <Button size="sm" onClick={() => toast.info("Reconciliation wizard coming soon")}>
            <Plus className="h-4 w-4 mr-2" />
            New Reconciliation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
        ) : reconciliations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reconciliation records yet.</p>
            <p className="text-sm mt-1">Start a new reconciliation to compare bank statements with internal records.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Bank Balance</TableHead>
                  <TableHead className="text-right">Book Balance</TableHead>
                  <TableHead className="text-right">Discrepancy</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliations.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-sm font-medium">{(rec as any).bank_connections?.bank_display_name || "—"}</TableCell>
                    <TableCell className="text-sm">{rec.period_start} — {rec.period_end}</TableCell>
                    <TableCell className="text-right text-sm">GHS {Number(rec.bank_closing_balance).toLocaleString("en-GH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-sm">GHS {Number(rec.book_closing_balance).toLocaleString("en-GH", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className={cn("text-right text-sm font-semibold", Number(rec.discrepancy_amount) !== 0 ? "text-destructive" : "text-emerald-600")}>
                      GHS {Number(rec.discrepancy_amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm">{rec.matched_count} / {rec.matched_count + rec.unmatched_count}</TableCell>
                    <TableCell>{getStatusBadge(rec.status)}</TableCell>
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
