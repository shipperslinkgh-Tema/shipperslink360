import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ChartAccount } from "@/types/accounts";

export function useChartOfAccounts() {
  return useQuery({
    queryKey: ["chart_of_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts" as any)
        .select("*")
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return (data as unknown as ChartAccount[]) ?? [];
    },
  });
}
