import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FXRates {
  rates: Record<string, number>; // 1 BASE = X GHS
  cached?: boolean;
  date?: string;
  fallback?: boolean;
}

export function useFXRates() {
  return useQuery<FXRates>({
    queryKey: ["fx-rates"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fx-rates");
      if (error) throw error;
      return data as FXRates;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Get the rate to convert 1 unit of `currency` to GHS.
 * Returns 1 for GHS, otherwise looks up the cached rate.
 */
export function useExchangeRate(currency: string): { rate: number; loading: boolean; date?: string } {
  const { data, isLoading } = useFXRates();
  if (currency === "GHS") return { rate: 1, loading: false };
  const rate = data?.rates?.[currency] ?? 1;
  return { rate, loading: isLoading, date: data?.date };
}
