export type WelfareStage = 'hr_review' | 'management_review' | 'approved' | 'rejected' | 'cancelled';
export function welfareReviewStage(status: string, own: boolean, isHR: boolean, isManagement: boolean, sameReviewer: boolean): 'hr' | 'management' | null {
  if (own) return null;
  if (status === 'hr_review' && isHR) return 'hr';
  if (status === 'management_review' && isManagement && !sameReviewer) return 'management';
  return null;
}
export function welfareAmountAllowed(amount: number, fixed: number | null, max: number | null) {
  return Number.isFinite(amount) && amount > 0 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.0001 && (fixed === null || amount === fixed) && (max === null || amount <= max);
}