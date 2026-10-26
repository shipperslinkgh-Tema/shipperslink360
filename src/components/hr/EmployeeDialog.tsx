import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Employee, EmployeeInput } from '@/hooks/useHR';

type Staff = { user_id: string; full_name: string; email: string; department: string };
export function EmployeeDialog({ employee, staff, onClose, onSave, busy }: { employee?: Employee; staff: Staff[]; onClose: () => void; onSave: (input: EmployeeInput) => void; busy: boolean }) {
  const [form, setForm] = useState({ full_name: employee?.full_name ?? '', email: employee?.email ?? '', phone: employee?.phone ?? '', department: employee?.department ?? 'operations', job_title: employee?.job_title ?? '', user_id: employee?.user_id ?? 'none', supervisor_user_id: employee?.supervisor_user_id ?? 'none', employment_type: employee?.employment_type ?? 'permanent', status: employee?.status ?? 'active', start_date: employee?.start_date ?? '', contract_end: employee?.contract_end ?? '', probation_end: employee?.probation_end ?? '', leave_entitlement: String(employee?.leave_entitlement ?? 0) });
  const change = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));
  const chooseAccount = (value: string) => {
    const account = staff.find(s => s.user_id === value);
    setForm(f => ({ ...f, user_id: value, ...(account ? { full_name: account.full_name, email: account.email, department: account.department } : {}) }));
  };
  const select = (key: keyof typeof form, label: string, options: { value: string; label: string }[]) => <div className="space-y-2"><Label>{label}</Label><Select value={form[key]} onValueChange={v => key === 'user_id' ? chooseAccount(v) : change(key, v)}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>;
  const input = (key: keyof typeof form, label: string, type = 'text', required = false) => <div className="space-y-2"><Label htmlFor={`employee-${key}`}>{label}</Label><Input id={`employee-${key}`} value={form[key]} type={type} min={type === 'number' ? 0 : undefined} required={required} onChange={e => change(key, e.target.value)} /></div>;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{employee ? 'Edit employee' : 'Add employee'}</DialogTitle></DialogHeader><form onSubmit={e => { e.preventDefault(); onSave({ ...form, id: employee?.id, user_id: form.user_id === 'none' ? null : form.user_id, supervisor_user_id: form.supervisor_user_id === 'none' ? null : form.supervisor_user_id, contract_end: form.contract_end || null, probation_end: form.probation_end || null, leave_entitlement: Number(form.leave_entitlement) }); }} className="space-y-5">
    {select('user_id', 'Linked staff account', [{ value: 'none', label: 'Not linked' }, ...staff.map(s => ({ value: s.user_id, label: s.full_name }))])}
    <div className="grid gap-4 sm:grid-cols-2">{input('full_name', 'Full name', 'text', true)}{input('job_title', 'Job title', 'text', true)}{input('email', 'Email', 'email')}{input('phone', 'Phone')}{select('department', 'Department', ['operations','documentation','accounts','marketing','customer_service','warehouse','management','super_admin'].map(d => ({ value: d, label: d.replace(/_/g,' ') })))}{select('supervisor_user_id','Supervisor',[{ value:'none', label:'Not assigned' }, ...staff.filter(s => s.user_id !== form.user_id).map(s => ({ value:s.user_id,label:s.full_name }))])}{select('employment_type','Employment type',['permanent','contract','internship'].map(v => ({value:v,label:v})))}{select('status','Employment status',['active','probation','exited'].map(v => ({value:v,label:v})))}{input('start_date','Employment start','date',true)}{input('contract_end','Contract end','date')}{input('probation_end','Probation end','date')}{input('leave_entitlement','Verified annual leave entitlement (days)','number',true)}</div>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save employee'}</Button></div>
  </form></DialogContent></Dialog>;
}