import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Consolidation, Shipper, DemurrageRecord, OperationalMetrics } from "@/types/consolidation";

export function useConsolidations() {
  return useQuery({
    queryKey: ["consolidations"],
    queryFn: async (): Promise<Consolidation[]> => {
      const { data, error } = await supabase
        .from("consolidations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any): Consolidation => ({
        id: c.id,
        consolidationRef: c.consolidation_ref,
        type: c.type,
        masterBLNumber: c.master_bl_number,
        masterAWBNumber: c.master_awb_number,
        origin: c.origin,
        destination: c.destination,
        vessel: c.vessel,
        voyage: c.voyage,
        flight: c.flight,
        carrier: c.carrier,
        etd: c.etd || "",
        eta: c.eta || "",
        status: c.status,
        containerNumber: c.container_number,
        containerType: c.container_type,
        totalCBM: Number(c.total_cbm) || 0,
        totalWeight: Number(c.total_weight) || 0,
        totalPackages: c.total_packages || 0,
        shippersCount: c.shippers_count || 0,
        port: c.port || "Tema",
        warehouse: c.warehouse,
        stuffingDate: c.stuffing_date,
        cutoffDate: c.cutoff_date,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    },
  });
}

export function useShippers(consolidationId?: string) {
  return useQuery({
    queryKey: ["consolidation-shippers", consolidationId],
    queryFn: async (): Promise<Shipper[]> => {
      let query = supabase.from("consolidation_shippers").select("*");
      if (consolidationId) query = query.eq("consolidation_id", consolidationId);
      const { data, error } = await query.order("created_at");
      if (error) throw error;
      return (data || []).map((s: any): Shipper => ({
        id: s.id,
        consolidationId: s.consolidation_id,
        houseBLNumber: s.house_bl_number,
        houseAWBNumber: s.house_awb_number,
        shipperName: s.shipper_name,
        shipperAddress: s.shipper_address || "",
        consigneeName: s.consignee_name,
        consigneeAddress: s.consignee_address || "",
        notifyParty: s.notify_party,
        description: s.description || "",
        hsCode: s.hs_code || "",
        hsDescription: s.hs_description || "",
        packages: s.packages || 0,
        packageType: s.package_type || "cartons",
        grossWeight: Number(s.gross_weight) || 0,
        netWeight: Number(s.net_weight) || 0,
        cbm: Number(s.cbm) || 0,
        cargoStatus: s.cargo_status || "pending",
        customsStatus: s.customs_status || "pending",
        icumsRef: s.icums_ref,
        dutyAmount: Number(s.duty_amount) || 0,
        taxAmount: Number(s.tax_amount) || 0,
        freightCharge: Number(s.freight_charge) || 0,
        handlingCharge: Number(s.handling_charge) || 0,
        documentationFee: Number(s.documentation_fee) || 0,
        storageCharge: Number(s.storage_charge) || 0,
        totalCharge: Number(s.total_charge) || 0,
        invoiced: s.invoiced || false,
        invoiceNumber: s.invoice_number,
        paid: s.paid || false,
        remarks: s.remarks,
        receivedDate: s.received_date,
        receivedBy: s.received_by,
        tallyConfirmed: s.tally_confirmed || false,
        releaseStatus: s.release_status || "pending",
      }));
    },
  });
}

export function useDemurrageRecords() {
  return useQuery({
    queryKey: ["demurrage-records"],
    queryFn: async (): Promise<DemurrageRecord[]> => {
      const { data, error } = await supabase
        .from("demurrage_records")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any): DemurrageRecord => ({
        id: d.id,
        consolidationId: d.consolidation_id,
        containerNumber: d.container_number,
        freeTimeStart: d.free_time_start,
        freeTimeDays: d.free_time_days || 14,
        freeTimeEnd: d.free_time_end,
        currentDays: d.current_days || 0,
        demurrageDays: d.demurrage_days || 0,
        dailyRate: Number(d.daily_rate) || 0,
        totalDemurrage: Number(d.total_demurrage) || 0,
        storageDays: d.storage_days || 0,
        storageRate: Number(d.storage_rate) || 0,
        totalStorage: Number(d.total_storage) || 0,
        status: d.status || "within_free",
        lastUpdated: d.last_updated,
      }));
    },
  });
}

export function useOperationalMetrics(): OperationalMetrics {
  const { data: consolidations } = useConsolidations();
  const cons = consolidations || [];
  const active = cons.filter(c => !["delivered", "closed"].includes(c.status));
  const customs = cons.filter(c => c.status === "customs");
  
  return {
    totalConsolidations: cons.length,
    activeConsolidations: active.length,
    pendingCustomsClearance: customs.length,
    totalRevenue: 0, // computed from finance tables
    averageTurnaroundDays: 0,
    demurrageCharges: 0,
    onTimeDeliveryRate: 0,
    totalCBMHandled: cons.reduce((s, c) => s + c.totalCBM, 0),
    totalShipments: cons.length,
  };
}
