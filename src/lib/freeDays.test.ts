import { describe, expect, it } from "vitest";
import {
  addDays,
  daysUntil,
  expiringBLCount,
  freeDaysExpiry,
  freeDaysLevel,
  summariseBLFreeDays,
} from "./freeDays";

describe("free days and ETA maths", () => {
  it("adds free days to the ETA", () => {
    expect(addDays("2026-11-02", 7)).toBe("2026-11-09");
    expect(addDays("2026-12-30", 5)).toBe("2027-01-04");
  });
  it("works out when free days run out", () => {
    expect(freeDaysExpiry("2026-11-02", 14)).toBe("2026-11-16");
    expect(freeDaysExpiry(null, 14)).toBeNull();
    expect(freeDaysExpiry("2026-11-02", null)).toBeNull();
  });
  it("counts days left, including overdue", () => {
    expect(daysUntil("2026-11-16", "2026-11-02")).toBe(14);
    expect(daysUntil("2026-11-02", "2026-11-16")).toBe(-14);
    expect(daysUntil(null, "2026-11-16")).toBeNull();
  });
  it("bands the remaining free days", () => {
    expect(freeDaysLevel(-1)).toBe("expired");
    expect(freeDaysLevel(0)).toBe("critical");
    expect(freeDaysLevel(2)).toBe("critical");
    expect(freeDaysLevel(3)).toBe("warning");
    expect(freeDaysLevel(5)).toBe("warning");
    expect(freeDaysLevel(6)).toBe("ok");
    expect(freeDaysLevel(null)).toBe("unknown");
  });
});

describe("bill of lading free days summary", () => {
  const docs = [
    { bl_number: "msku2345678", shipping_line: "Maersk", eta: "2026-11-02", free_days: 14 },
    { bl_number: "MSKU2345678", shipping_line: "Maersk", eta: null, free_days: null },
    { bl_number: "CMA998877", shipping_line: "CMA CGM", eta: "2026-11-20", free_days: 7 },
    { bl_number: null, shipping_line: "ZIM", eta: "2026-11-01", free_days: 3 },
  ];

  it("keeps one row per BL and ignores entries with no BL", () => {
    const rows = summariseBLFreeDays(docs, "2026-11-02");
    expect(rows.map((r) => r.bl)).toEqual(["CMA998877", "MSKU2345678"]);
    expect(rows.find((r) => r.bl === "MSKU2345678")?.documents).toBe(2);
  });

  it("carries the ETA and free days forward to later uploads on the same BL", () => {
    const rows = summariseBLFreeDays(docs, "2026-11-02");
    const maersk = rows.find((r) => r.bl === "MSKU2345678");
    expect(maersk?.eta).toBe("2026-11-02");
    expect(maersk?.freeDays).toBe(14);
    expect(maersk?.expiry).toBe("2026-11-16");
    expect(maersk?.daysLeft).toBe(14);
    expect(maersk?.level).toBe("ok");
  });

  it("flags BLs whose free days are running out", () => {
    const rows = summariseBLFreeDays(docs, "2026-11-24");
    expect(rows.find((r) => r.bl === "CMA998877")?.level).toBe("expired");
    expect(expiringBLCount(rows)).toBe(1);
  });
});
