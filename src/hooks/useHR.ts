import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type Employee = Database['public']['Tables']['hr_employees']['Row'];
export type EmployeeInput = Database['public']['Tables']['hr_employees']['Insert'];

export function useHR() {
  const { user, roles, department } = useAuth();
  const cache = useQueryClient();
  const access = useQuery({ queryKey: ['hr', 'access', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('hr_access').select('*');
    if (error) throw error; return data;
  }});
  const manager = roles.includes('super_admin') || department === 'management' || access.data?.some(a => a.user_id === user?.id && a.access_role === 'hr') === true;
  const supervisor = access.data?.some(a => a.user_id === user?.id && a.access_role === 'supervisor') === true;
  const employees = useQuery({ queryKey: ['hr', 'employees', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('hr_employees').select('*').order('full_name');
    if (error) throw error; return data;
  }});
  const attendance = useQuery({ queryKey: ['hr', 'attendance', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('hr_attendance').select('*').order('work_date', { ascending: false }).limit(500);
    if (error) throw error; return data;
  }});
  const leave = useQuery({ queryKey: ['hr', 'leave', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from('hr_leave_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error; return data;
  }});
  const staff = useQuery({ queryKey: ['hr', 'staff', user?.id], enabled: !!user && manager, queryFn: async () => {
    const { data, error } = await supabase.rpc('hr_staff_accounts');
    if (error) throw error; return data;
  }});
  const action = useMutation({ mutationFn: async (run: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await run(); if (error) throw new Error(error.message);
  }, onSuccess: () => { cache.invalidateQueries({ queryKey: ['hr'] }); toast.success('Saved successfully'); }, onError: (error: Error) => toast.error(error.message) });
  return { user, manager, supervisor, superAdmin: roles.includes('super_admin'), access, employees, attendance, leave, staff, action };
}