import { describe, expect, it } from 'vitest';
import { countLeaveWeekdays, mayReviewLeave, remainingAnnualLeave } from './hr';

describe('HR permissions and balances', () => {
  it('prevents self-approval even for HR managers', () => {
    expect(mayReviewLeave(true, false, true, true)).toBe(false);
    expect(mayReviewLeave(true, false, false, true)).toBe(true);
  });
  it('does not allow employees to approve other employee requests', () => {
    expect(mayReviewLeave(false, false, false, true)).toBe(false);
    expect(mayReviewLeave(false, true, false, true)).toBe(true);
  });
  it('counts weekdays, not weekend days', () => {
    expect(countLeaveWeekdays('2026-10-23', '2026-10-26')).toBe(2);
    expect(countLeaveWeekdays('2026-10-24', '2026-10-25')).toBe(0);
  });
  it('deducts only approved annual leave in the matching year', () => {
    expect(remainingAnnualLeave(20, [
      { leave_type: 'annual', status: 'approved', days: 4, start_date: '2026-10-26' },
      { leave_type: 'annual', status: 'pending', days: 7, start_date: '2026-11-01' },
      { leave_type: 'sick', status: 'approved', days: 3, start_date: '2026-09-01' },
      { leave_type: 'annual', status: 'approved', days: 9, start_date: '2025-09-01' },
    ], 2026)).toBe(16);
  });
});