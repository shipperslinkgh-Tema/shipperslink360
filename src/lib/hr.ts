export function countLeaveWeekdays(start: string, end: string): number {
  const first = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime()) || last < first) return 0;
  let days = 0;
  for (let date = first; date <= last; date = new Date(date.getTime() + 86400000)) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days++;
  }
  return days;
}

export function mayReviewLeave(manager: boolean, supervisor: boolean, own: boolean, pending: boolean): boolean {
  return !own && pending && (manager || supervisor);
}

export function remainingAnnualLeave(entitlement: number, requests: { leave_type: string; status: string; days: number; start_date: string }[], year: number): number {
  return entitlement - requests.filter(r => r.leave_type === 'annual' && r.status === 'approved' && Number(r.start_date.slice(0, 4)) === year).reduce((sum, r) => sum + Number(r.days), 0);
}