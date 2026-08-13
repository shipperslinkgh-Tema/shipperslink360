import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Centralised "data memory" for smart auto-fill.
 * Every suggestion list is derived from live database records — no extra tables,
 * so suggestions are always in sync with what the business actually has on file.
 */

type Source = { table: string; column: string };

export const MEMORY_SOURCES: Record<string, Source[]> = {
  origin_port: [
    { table: "consignment_workflows", column: "port_of_loading" },
    { table: "consignment_workflows", column: "origin_country" },
  ],
  destination_port: [
    { table: "consignment_workflows", column: "port_of_discharge" },
  ],
  vessel: [{ table: "consignment_workflows", column: "vessel_name" }],
  voyage: [{ table: "consignment_workflows", column: "voyage_number" }],
  flight: [{ table: "consignment_workflows", column: "flight_number" }],
  container: [
    { table: "consignment_workflows", column: "container_number" },
    { table: "trucking_trips", column: "container_number" },
  ],
  bl_number: [
    { table: "consignment_workflows", column: "bl_number" },
    { table: "trucking_trips", column: "bl_number" },
  ],
  awb_number: [{ table: "consignment_workflows", column: "awb_number" }],
  cargo_description: [
    { table: "consignment_workflows", column: "cargo_description" },
  ],
  trip_origin: [
    { table: "trucking_trips", column: "origin" },
    { table: "consignment_workflows", column: "terminal" },
  ],
  trip_destination: [{ table: "trucking_trips", column: "destination" }],
  job_ref: [{ table: "finance_invoices", column: "job_ref" }],
  shipment_ref: [
    { table: "consignment_workflows", column: "consignment_ref" },
    { table: "finance_invoices", column: "shipment_ref" },
  ],
  invoice_description: [{ table: "finance_invoices", column: "description" }],
  officer: [{ table: "consignment_workflows", column: "assigned_officer" }],
};

export type MemoryKey = keyof typeof MEMORY_SOURCES;

async function fetchMemory(key: string): Promise<string[]> {
  const sources = MEMORY_SOURCES[key] ?? [];
  const results = await Promise.all(
    sources.map(async (s) => {
      const { data, error } = await supabase
        .from(s.table as any)
        .select(s.column)
        .not(s.column, "is", null)
        .order("created_at", { ascending: false })
        .limit(400);
      if (error) return [] as string[];
      return (data ?? [])
        .map((row: any) => row[s.column])
        .filter((v: any): v is string => typeof v === "string" && v.trim().length > 0)
        .map((v: string) => v.trim());
    })
  );

  const seen = new Map<string, string>();
  for (const value of results.flat()) {
    const norm = value.toLowerCase();
    if (!seen.has(norm)) seen.set(norm, value);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

/** Remembered values for a given field kind, pulled from live records. */
export function useDataMemory(key: MemoryKey | string, enabled = true) {
  return useQuery({
    queryKey: ["data-memory", key],
    queryFn: () => fetchMemory(String(key)),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/** Loose similarity used for duplicate detection (case/punctuation insensitive). */
export function normalizeValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findSimilar(value: string, options: string[]) {
  const norm = normalizeValue(value);
  if (norm.length < 3) return undefined;
  return options.find((o) => normalizeValue(o) === norm && o.trim() !== value.trim());
}
