import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedDocumentData {
  document_type: string;
  shipper_name?: string;
  consignee_name?: string;
  notify_party?: string;
  bl_number?: string;
  awb_number?: string;
  container_number?: string;
  vessel_name?: string;
  voyage_number?: string;
  flight_number?: string;
  port_of_loading?: string;
  port_of_discharge?: string;
  origin_country?: string;
  cargo_description?: string;
  hs_code?: string;
  weight_kg?: number;
  net_weight_kg?: number;
  volume_cbm?: number;
  packages?: number;
  package_type?: string;
  invoice_number?: string;
  invoice_date?: string;
  invoice_currency?: string;
  fob_value?: number;
  freight_value?: number;
  insurance_value?: number;
  cif_value?: number;
  total_amount?: number;
  incoterms?: string;
  shipping_line?: string;
  eta?: string;
  etd?: string;
  marks_and_numbers?: string;
  supplier_name?: string;
  buyer_name?: string;
  line_items?: Array<{
    description: string;
    quantity?: number;
    unit_price?: number;
    total?: number;
    hs_code?: string;
    weight_kg?: number;
  }>;
  confidence_notes?: string;
}

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);

  const processDocument = async (file: File, documentHint?: string): Promise<ExtractedDocumentData | null> => {
    setIsProcessing(true);
    setExtractedData(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("process-document", {
        body: { image_base64: base64, document_hint: documentHint },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setExtractedData(data.data);
        toast.success(`${getDocTypeLabel(data.data.document_type)} processed successfully`);
        return data.data;
      } else {
        throw new Error(data?.error || "Failed to extract data");
      }
    } catch (err: any) {
      console.error("Document processing error:", err);
      const message = err?.message || "Failed to process document";
      toast.error(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearExtractedData = () => setExtractedData(null);

  return { processDocument, isProcessing, extractedData, clearExtractedData };
}

function getDocTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bill_of_lading: "Bill of Lading",
    commercial_invoice: "Commercial Invoice",
    packing_list: "Packing List",
    air_waybill: "Air Waybill",
  };
  return labels[type] || "Document";
}

/**
 * Maps extracted document data to consignment workflow form fields
 */
export function mapExtractedDataToForm(data: ExtractedDocumentData): Record<string, string | boolean> {
  const mapped: Record<string, string | boolean> = {};

  if (data.consignee_name) mapped.client_name = data.consignee_name;
  if (data.supplier_name || data.shipper_name) mapped.supplier_name = data.supplier_name || data.shipper_name || "";
  if (data.origin_country) mapped.origin_country = data.origin_country;
  if (data.port_of_loading) mapped.port_of_loading = data.port_of_loading;
  if (data.port_of_discharge) mapped.port_of_discharge = data.port_of_discharge;
  if (data.container_number) mapped.container_number = data.container_number;
  if (data.bl_number) mapped.bl_number = data.bl_number;
  if (data.awb_number) mapped.awb_number = data.awb_number;
  if (data.cargo_description) mapped.cargo_description = data.cargo_description;
  if (data.weight_kg) mapped.weight_kg = String(data.weight_kg);
  if (data.volume_cbm) mapped.volume_cbm = String(data.volume_cbm);
  if (data.vessel_name) mapped.vessel_name = data.vessel_name;
  if (data.voyage_number) mapped.voyage_number = data.voyage_number;
  if (data.eta) mapped.eta = data.eta;
  if (data.incoterms) mapped.incoterms = data.incoterms;
  if (data.shipping_line) mapped.shipping_line = data.shipping_line;
  if (data.hs_code) mapped.hs_code = data.hs_code;
  if (data.fob_value) mapped.fob_value = String(data.fob_value);
  if (data.freight_value) mapped.freight_value = String(data.freight_value);
  if (data.insurance_value) mapped.insurance_value = String(data.insurance_value);
  if (data.cif_value) mapped.cif_value = String(data.cif_value);

  // Detect shipment type from document
  if (data.document_type === "air_waybill" || data.awb_number || data.flight_number) {
    mapped.shipment_type = "air";
  } else if (data.bl_number || data.vessel_name) {
    mapped.shipment_type = "sea";
  }

  return mapped;
}
