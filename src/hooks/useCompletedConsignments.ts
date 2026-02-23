import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CompletedConsignment {
  id: string;
  consignment_ref: string;
  bl_number: string | null;
  awb_number: string | null;
  container_numbers: string[];
  client_name: string;
  client_id: string | null;
  shipment_type: "sea" | "air";
  clearance_date: string | null;
  delivery_date: string | null;
  officer_in_charge: string;
  officer_user_id: string | null;
  status: string;
  is_locked: boolean;
  total_revenue: number;
  total_expenses: number;
  financial_summary: Record<string, unknown> | null;
  notes: string | null;
  completed_by: string | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConsignmentDocument {
  id: string;
  consignment_id: string;
  category: "customs" | "shipping_line" | "company_financial" | "warehouse" | "shipping";
  document_type: string;
  document_name: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: number;
  is_current: boolean;
  previous_version_id: string | null;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  notes: string | null;
  created_at: string;
}

export interface ConsignmentAuditLog {
  id: string;
  consignment_id: string;
  document_id: string | null;
  action: string;
  action_details: Record<string, unknown> | null;
  performed_by: string;
  performed_by_name: string;
  ip_address: string | null;
  created_at: string;
}

// Document checklist definition
export const DOCUMENT_CHECKLIST: Record<string, { category: string; types: string[] }> = {
  customs: {
    category: "Customs Documents",
    types: ["Bill of Entry (BOE)", "IDF (Import Declaration Form)", "Customs Payment Receipts", "Examination / Clearance Reports"],
  },
  shipping_line: {
    category: "Shipping Line Documents",
    types: ["Shipping Line Invoice", "Local Charges Invoice", "Demurrage / Detention Invoice", "Shipping Line Payment Receipts"],
  },
  company_financial: {
    category: "Company Financial Documents",
    types: ["Client Invoice (Company Bill)", "Client Payment Receipt", "Expense Receipts"],
  },
  warehouse: {
    category: "Warehouse Documents",
    types: ["GRN", "Warehouse Release Note"],
  },
  shipping: {
    category: "Shipping Documents",
    types: ["BL / AWB", "Commercial Invoice", "Packing List"],
  },
};

export function useCompletedConsignments(searchQuery?: string) {
  return useQuery({
    queryKey: ["completed-consignments", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("completed_consignments")
        .select("*")
        .order("completed_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `bl_number.ilike.%${searchQuery}%,awb_number.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%,consignment_ref.ilike.%${searchQuery}%,container_numbers.cs.{${searchQuery}}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CompletedConsignment[];
    },
  });
}

export function useConsignmentDocuments(consignmentId: string | null) {
  return useQuery({
    queryKey: ["consignment-documents", consignmentId],
    queryFn: async () => {
      if (!consignmentId) return [];
      const { data, error } = await supabase
        .from("consignment_documents")
        .select("*")
        .eq("consignment_id", consignmentId)
        .eq("is_current", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return (data || []) as ConsignmentDocument[];
    },
    enabled: !!consignmentId,
  });
}

export function useDocumentVersions(documentType: string, consignmentId: string | null) {
  return useQuery({
    queryKey: ["document-versions", consignmentId, documentType],
    queryFn: async () => {
      if (!consignmentId) return [];
      const { data, error } = await supabase
        .from("consignment_documents")
        .select("*")
        .eq("consignment_id", consignmentId)
        .eq("document_type", documentType)
        .order("version", { ascending: false });
      if (error) throw error;
      return (data || []) as ConsignmentDocument[];
    },
    enabled: !!consignmentId && !!documentType,
  });
}

export function useConsignmentAuditLogs(consignmentId: string | null) {
  return useQuery({
    queryKey: ["consignment-audit-logs", consignmentId],
    queryFn: async () => {
      if (!consignmentId) return [];
      const { data, error } = await supabase
        .from("consignment_audit_logs")
        .select("*")
        .eq("consignment_id", consignmentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ConsignmentAuditLog[];
    },
    enabled: !!consignmentId,
  });
}

export function useCreateConsignment() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<CompletedConsignment>) => {
      const { data: result, error } = await supabase
        .from("completed_consignments")
        .insert({
          ...data,
          completed_by: user?.id,
          consignment_ref: data.consignment_ref || `CON-${Date.now().toString(36).toUpperCase()}`,
          client_name: data.client_name || "",
          officer_in_charge: data.officer_in_charge || profile?.full_name || "",
          shipment_type: data.shipment_type || "sea",
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Audit log
      await supabase.from("consignment_audit_logs").insert({
        consignment_id: result.id,
        action: "created",
        action_details: { consignment_ref: result.consignment_ref },
        performed_by: user!.id,
        performed_by_name: profile?.full_name || "Unknown",
      } as any);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completed-consignments"] });
      toast.success("Consignment created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadConsignmentDocument() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      consignmentId,
      category,
      documentType,
      file,
      notes,
    }: {
      consignmentId: string;
      category: string;
      documentType: string;
      file: File;
      notes?: string;
    }) => {
      // Check for existing doc of same type → version increment
      const { data: existing } = await supabase
        .from("consignment_documents")
        .select("id, version")
        .eq("consignment_id", consignmentId)
        .eq("document_type", documentType)
        .eq("is_current", true)
        .maybeSingle();

      const newVersion = existing ? existing.version + 1 : 1;

      // Mark old version as not current
      if (existing) {
        await supabase
          .from("consignment_documents")
          .update({ is_current: false } as any)
          .eq("id", existing.id);
      }

      // Upload file
      const filePath = `${consignmentId}/${category}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("consignment-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Insert doc record
      const { data: doc, error } = await supabase
        .from("consignment_documents")
        .insert({
          consignment_id: consignmentId,
          category,
          document_type: documentType,
          document_name: file.name,
          file_url: filePath,
          file_size: file.size,
          mime_type: file.type,
          version: newVersion,
          is_current: true,
          previous_version_id: existing?.id || null,
          uploaded_by: user!.id,
          uploaded_by_name: profile?.full_name || "Unknown",
          notes,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Audit log
      await supabase.from("consignment_audit_logs").insert({
        consignment_id: consignmentId,
        document_id: doc.id,
        action: "document_uploaded",
        action_details: { document_type: documentType, file_name: file.name, version: newVersion },
        performed_by: user!.id,
        performed_by_name: profile?.full_name || "Unknown",
      } as any);

      return doc;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["consignment-documents", vars.consignmentId] });
      queryClient.invalidateQueries({ queryKey: ["consignment-audit-logs", vars.consignmentId] });
      toast.success("Document uploaded successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDownloadConsignmentDocument() {
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (doc: ConsignmentDocument) => {
      if (!doc.file_url) throw new Error("No file URL");
      const { data, error } = await supabase.storage
        .from("consignment-files")
        .download(doc.file_url);
      if (error) throw error;

      // Audit log
      await supabase.from("consignment_audit_logs").insert({
        consignment_id: doc.consignment_id,
        document_id: doc.id,
        action: "document_downloaded",
        action_details: { document_name: doc.document_name },
        performed_by: user!.id,
        performed_by_name: profile?.full_name || "Unknown",
      } as any);

      // Trigger browser download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.document_name;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
