import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Map of database table → React Query keys to invalidate when any row changes.
 * Keep keys aligned with `queryKey` values used across the app's hooks.
 */
const TABLE_KEY_MAP: Record<string, string[]> = {
  consignment_workflows: ["consignments", "department-stats", "port-command", "workflow"],
  consignment_documents: ["consignment-documents", "consignments"],
  consignment_events: ["consignment-events", "activity-feed"],
  completed_consignments: ["completed-consignments", "department-stats"],
  trucking_trips: ["trucking-trips", "trips", "department-stats"],
  trucking_jobs: ["trucking-jobs", "trips"],
  trucks: ["trucks", "department-stats"],
  drivers: ["drivers", "department-stats"],
  customers: ["customers", "department-stats"],
  customer_contacts: ["customers"],
  customer_documents: ["customers"],
  finance_invoices: ["finance-invoices", "department-stats", "accounts-dashboard"],
  finance_expenses: ["finance-expenses", "department-stats", "accounts-dashboard"],
  client_invoices: ["client-invoices", "department-stats"],
  client_payments: ["client-payments", "client-invoices"],
  client_shipments: ["client-shipments"],
  client_documents: ["client-documents"],
  vouchers: ["vouchers", "accounts-dashboard"],
  voucher_lines: ["vouchers"],
  ledger_entries: ["ledger", "accounts-dashboard"],
  notifications: ["notifications", "notification-count"],
  trip_gps_logs: ["trip-gps"],
};

/**
 * Subscribes once per session to all key tables and invalidates the matching
 * React Query caches whenever a change is broadcast. This is the foundation
 * of cross-module real-time sync — no manual refresh needed anywhere.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("global-realtime-sync");

    Object.entries(TABLE_KEY_MAP).forEach(([table, keys]) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => {
          keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
