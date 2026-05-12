import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccountsAccess } from "@/hooks/useAccountsAccess";
import VoucherDialog from "./VoucherDialog";
import { Receipt } from "lucide-react";

export default function AccountsExpenses() {
  const { canEdit } = useAccountsAccess();
  const [payFor, setPayFor] = useState<any | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["finance_expenses_acct"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_expenses").select("*").order("expense_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3">Ref</th>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && data.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No expenses recorded.</td></tr>}
              {data.map((ex: any) => (
                <tr key={ex.id} className="border-t hover:bg-muted/40">
                  <td className="p-3 font-mono">{ex.expense_ref}</td>
                  <td className="p-3">{ex.expense_date}</td>
                  <td className="p-3 capitalize">{ex.category}</td>
                  <td className="p-3">{ex.description}</td>
                  <td className="p-3 text-right font-medium">{ex.currency} {Number(ex.amount).toLocaleString()}</td>
                  <td className="p-3"><Badge variant="outline">{ex.status}</Badge></td>
                  <td className="p-3 text-right">
                    {canEdit && ex.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => setPayFor(ex)}>
                        <Receipt className="h-4 w-4 mr-1" />Pay & Post
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {payFor && (
        <VoucherDialog
          open={!!payFor}
          onOpenChange={(o) => !o && setPayFor(null)}
          type="payment"
          preset={{
            voucher_type: "payment",
            party_name: payFor.requested_by ?? "Vendor",
            currency: payFor.currency,
            reference: payFor.expense_ref,
            narration: payFor.description,
          }}
        />
      )}
    </div>
  );
}
