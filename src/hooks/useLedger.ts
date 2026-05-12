import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LedgerEntry } from "@/types/accounts";

export function useLedger(filter?: { accountId?: string; customerId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["ledger", filter],
    queryFn: async () => {
      let q = supabase.from("ledger_entries" as any).select("*").order("entry_date", { ascending: true });
      if (filter?.accountId) q = q.eq("account_id", filter.accountId);
      if (filter?.customerId) q = q.eq("customer_id", filter.customerId);
      if (filter?.from) q = q.gte("entry_date", filter.from);
      if (filter?.to) q = q.lte("entry_date", filter.to);
      const { data, error } = await q.limit(2000);
      if (error) throw error;
      return (data as unknown as LedgerEntry[]) ?? [];
    },
  });
}
