import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher, VoucherLine, VoucherType } from "@/types/accounts";
import { toast } from "sonner";

export function useVouchers(filter?: { type?: VoucherType; status?: string; consignmentId?: string; customerId?: string }) {
  return useQuery({
    queryKey: ["vouchers", filter],
    queryFn: async () => {
      let q = supabase.from("vouchers" as any).select("*").order("voucher_date", { ascending: false }).order("created_at", { ascending: false });
      if (filter?.type) q = q.eq("voucher_type", filter.type);
      if (filter?.status) q = q.eq("status", filter.status);
      if (filter?.consignmentId) q = q.eq("consignment_id", filter.consignmentId);
      if (filter?.customerId) q = q.eq("customer_id", filter.customerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as Voucher[]) ?? [];
    },
  });
}

export function useVoucher(id?: string) {
  return useQuery({
    queryKey: ["voucher", id],
    enabled: !!id,
    queryFn: async () => {
      const [v, lines] = await Promise.all([
        supabase.from("vouchers" as any).select("*").eq("id", id).single(),
        supabase.from("voucher_lines" as any).select("*").eq("voucher_id", id).order("line_no"),
      ]);
      if (v.error) throw v.error;
      if (lines.error) throw lines.error;
      return { voucher: v.data as unknown as Voucher, lines: (lines.data as unknown as VoucherLine[]) ?? [] };
    },
  });
}

export function useSaveVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { voucher: Partial<Voucher>; lines: VoucherLine[] }) => {
      const { voucher, lines } = payload;
      const cleanLines = lines.filter((l) => l.account_id && (Number(l.debit) > 0 || Number(l.credit) > 0));
      const total = cleanLines.reduce((s, l) => s + Math.max(Number(l.debit || 0), Number(l.credit || 0)), 0);
      const upsertPayload: any = {
        ...voucher,
        total_amount: total,
        ghs_equivalent: total * Number(voucher.exchange_rate ?? 1),
      };
      let voucherId = voucher.id;
      if (voucherId) {
        const { error } = await supabase.from("vouchers" as any).update(upsertPayload).eq("id", voucherId);
        if (error) throw error;
        await supabase.from("voucher_lines" as any).delete().eq("voucher_id", voucherId);
      } else {
        const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
        const { data, error } = await supabase
          .from("vouchers" as any)
          .insert({ ...upsertPayload, created_by: userId })
          .select("id")
          .single();
        if (error) throw error;
        voucherId = (data as any).id as string;
      }
      if (cleanLines.length) {
        const rows = cleanLines.map((l, i) => ({
          voucher_id: voucherId,
          line_no: i + 1,
          account_id: l.account_id,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description ?? null,
        }));
        const { error } = await supabase.from("voucher_lines" as any).insert(rows);
        if (error) throw error;
      }
      return voucherId!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("Voucher saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save voucher"),
  });
}

export function usePostVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("post_voucher" as any, { _voucher_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["accounts_dashboard"] });
      toast.success("Voucher posted to ledger");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to post voucher"),
  });
}

export function useCancelVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("cancel_voucher" as any, { _voucher_id: id, _reason: reason });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      toast.success("Voucher cancelled");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to cancel voucher"),
  });
}
