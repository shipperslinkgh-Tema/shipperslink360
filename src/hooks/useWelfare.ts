import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
export type WelfarePolicy = Database['public']['Tables']['welfare_policies']['Row'];
export type WelfareRequest = Database['public']['Tables']['welfare_requests']['Row'];
export function useWelfare() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const access = useQuery({ queryKey: ['welfare', 'access', user?.id], enabled: !!user, queryFn: async () => {
    const [hr, management] = await Promise.all([supabase.rpc('welfare_is_hr'), supabase.rpc('welfare_is_management')]);
    if (hr.error || management.error) throw hr.error || management.error;
    return { hr: hr.data === true, management: management.data === true };
  }});
  const policies = useQuery({ queryKey: ['welfare', 'policies', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('welfare_policies').select('*').order('name'); if (error) throw error; return data;
  }});
  const requests = useQuery({ queryKey: ['welfare', 'requests', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('welfare_requests').select('*').order('created_at', { ascending: false }); if (error) throw error;
    return Promise.all(data.map(async r => { const payment = await supabase.rpc('welfare_payment_status', { _id: r.id }); if (payment.error) throw payment.error; return { ...r, payment: payment.data?.[0] }; }));
  }});
  const action = useMutation({ mutationFn: async (run: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await run(); if (error) throw new Error(error.message);
  }, onSuccess: () => { cache.invalidateQueries({ queryKey: ['welfare'] }); cache.invalidateQueries({ queryKey: ['vouchers'] }); toast.success('Saved successfully'); }, onError: (e: Error) => toast.error(e.message) });
  return { user, access, policies, requests, action };
}