// Free-days tracking helpers for shipping line documents uploaded against a BL.
// All dates are plain YYYY-MM-DD strings handled in UTC so results never shift
// with the viewer's timezone.

export type FreeDaysLevel = "unknown" | "expired" | "critical" | "warning" | "ok";

/** Add whole days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Date the free days run out: ETA plus the granted free days. */
export function freeDaysExpiry(
  eta: string | null | undefined,
  freeDays: number | null | undefined,
): string | null {
  if (!eta || freeDays == null || !Number.isFinite(freeDays)) return null;
  return addDays(eta, Math.trunc(freeDays));
}

/** Whole days from `today` until `iso`; negative means already past. */
export function daysUntil(iso: string | null | undefined, today: string): number | null {
  if (!iso) return null;
  const target = Date.parse(`${iso}T00:00:00Z`);
  const from = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(target) || Number.isNaN(from)) return null;
  return Math.round((target - from) / 86400000);
}

/** Colour band for how much of the free period is left. */
export function freeDaysLevel(daysLeft: number | null): FreeDaysLevel {
  if (daysLeft == null) return "unknown";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 2) return "critical";
  if (daysLeft <= 5) return "warning";
  return "ok";
}

/** Today as YYYY-MM-DD in the viewer's own calendar. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface BLFreeDaysEntry {
  bl: string;
  shippingLine: string;
  eta: string | null;
  freeDays: number | null;
  expiry: string | null;
  daysLeft: number | null;
  level: FreeDaysLevel;
  documents: number;
}

/**
 * Collapse uploaded documents into one row per bill of lading, keeping the most
 * recent ETA and free-days value recorded against that BL.
 * `documents` must be newest-first, as the table query returns it.
 */
export function summariseBLFreeDays(
  documents: {
    bl_number: string | null;
    shipping_line: string;
    eta: string | null;
    free_days: number | null;
  }[],
  today: string = todayISO(),
): BLFreeDaysEntry[] {
  const byBL = new Map<
    string,
    { bl: string; shippingLine: string; eta: string | null; freeDays: number | null; documents: number }
  >();

  for (const doc of documents) {
    const bl = (doc.bl_number || "").trim().toUpperCase();
    if (!bl) continue;
    const existing = byBL.get(bl);
    if (existing) {
      existing.documents += 1;
      if (!existing.eta && doc.eta) existing.eta = doc.eta;
      if (existing.freeDays == null && doc.free_days != null) existing.freeDays = doc.free_days;
      if (!existing.shippingLine && doc.shipping_line) existing.shippingLine = doc.shipping_line;
    } else {
      byBL.set(bl, {
        bl,
        shippingLine: doc.shipping_line,
        eta: doc.eta,
        freeDays: doc.free_days,
        documents: 1,
      });
    }
  }

  return [...byBL.values()]
    .map((row) => {
      const expiry = freeDaysExpiry(row.eta, row.freeDays);
      const daysLeft = daysUntil(expiry, today);
      return {
        ...row,
        expiry,
        daysLeft,
        level: freeDaysLevel(daysLeft),
      };
    })
    .sort((a, b) => (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER));
}

/** BLs whose free period is running out (5 days or fewer, including expired). */
export function expiringBLCount(entries: BLFreeDaysEntry[]): number {
  return entries.filter((e) => e.daysLeft != null && e.daysLeft <= 5).length;
}
