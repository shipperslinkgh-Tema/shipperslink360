import { describe, expect, it } from 'vitest';
import { welfareReviewStage, welfareAmountAllowed } from './welfare';
describe('Welfare rules', () => {
  it('requires HR review before management approval', () => {
    expect(welfareReviewStage('hr_review', false, false, true, false)).toBe(null);
    expect(welfareReviewStage('hr_review', false, true, false, false)).toBe('hr');
    expect(welfareReviewStage('management_review', false, false, true, false)).toBe('management');
  });
  it('prevents self approval', () => { expect(welfareReviewStage('hr_review', true, true, true, false)).toBe(null); });
  it('requires a separate final approver', () => { expect(welfareReviewStage('management_review', false, true, true, true)).toBe(null); });
  it('enforces user configured fixed amounts and limits', () => {
    expect(welfareAmountAllowed(100, 100, 200)).toBe(true);
    expect(welfareAmountAllowed(101, 100, 200)).toBe(false);
    expect(welfareAmountAllowed(201, null, 200)).toBe(false);
    expect(welfareAmountAllowed(0, null, null)).toBe(false);
  });
});