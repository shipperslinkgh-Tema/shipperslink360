import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  ConsignmentWorkflow,
  WorkflowDocument,
  WorkflowTimelineEvent,
  WorkflowNotification,
  WorkflowStage,
} from "@/types/workflow";
import { WORKFLOW_STAGES, STAGE_INDEX } from "@/types/workflow";

// ── Helpers ────────────────────────────────────────────────────

function getNextStage(current: WorkflowStage): WorkflowStage | null {
  const idx = STAGE_INDEX[current];
  const next = WORKFLOW_STAGES[idx + 1];
  return next ? next.key : null;
}

function getStageTimestampField(stage: WorkflowStage): string {
  const map: Record<WorkflowStage, string> = {
    documents_received: "documents_received_at",
    documentation_processing: "documentation_started_at",
    customs_declaration: "customs_declared_at",
    duty_payment: "duty_paid_at",
    port_processing: "port_processing_at",
    cargo_release: "cargo_released_at",
    truck_assignment: "truck_assigned_at",
    delivery_in_transit: "delivery_started_at",
    delivery_completed: "delivery_completed_at",
  };
  return map[stage];
}

function getStageByField(stage: WorkflowStage): string {
  const map: Record<WorkflowStage, string> = {
    documents_received: "documents_received_by",
    documentation_processing: "documentation_completed_by",
    customs_declaration: "customs_declared_by",
    duty_payment: "duty_paid_by",
    port_processing: "port_processing_by",
    cargo_release: "cargo_released_by",
    truck_assignment: "truck_assigned_by",
    delivery_in_transit: "delivery_completed_by",
    delivery_completed: "delivery_completed_by",
  };
  return map[stage];
}

async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("consignment_workflows")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);
  const num = (count || 0) + 1;
  return `SL-${year}-${String(num).padStart(4, "0")}`;
}

// ── Hooks ──────────────────────────────────────────────────────

export function useConsignmentWorkflows(filters?: {
  stage?: WorkflowStage;
  search?: string;
}) {
  return useQuery({
    queryKey: ["consignment-workflows", filters],
    queryFn: async () => {
      let query = supabase
        .from("consignment_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.stage) {
        query = query.eq("current_stage", filters.stage);
      }
      if (filters?.search) {
        query = query.or(
          `consignment_ref.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,container_number.ilike.%${filters.search}%,bl_number.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ConsignmentWorkflow[];
    },
  });
}

export function useConsignmentWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ["consignment-workflow", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("consignment_workflows")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as ConsignmentWorkflow;
    },
    enabled: !!id,
  });
}

export function useWorkflowDocuments(workflowId: string | undefined) {
  return useQuery({
    queryKey: ["workflow-documents", workflowId],
    queryFn: async () => {
      if (!workflowId) return [];
      const { data, error } = await supabase
        .from("workflow_documents")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as WorkflowDocument[];
    },
    enabled: !!workflowId,
  });
}

export function useWorkflowTimeline(workflowId: string | undefined) {
  return useQuery({
    queryKey: ["workflow-timeline", workflowId],
    queryFn: async () => {
      if (!workflowId) return [];
      const { data, error } = await supabase
        .from("workflow_timeline")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as WorkflowTimelineEvent[];
    },
    enabled: !!workflowId,
  });
}

export function useWorkflowNotifications(department?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["workflow-notifications", department],
    queryFn: async () => {
      let query = supabase
        .from("workflow_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (department) {
        query = query.eq("target_department", department);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as WorkflowNotification[];
    },
  });
}

export function useUnreadWorkflowNotifications(department?: string) {
  return useQuery({
    queryKey: ["workflow-notifications-unread", department],
    queryFn: async () => {
      let query = supabase
        .from("workflow_notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (department) {
        query = query.eq("target_department", department);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });
}

// ── Mutations ──────────────────────────────────────────────────

export function useCreateConsignment() {
  const queryClient = useQueryClient();
  const { session, profile } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Partial<ConsignmentWorkflow> & { client_name: string }
    ) => {
      const ref = await generateRef();
      const userId = session?.user?.id;

      const { data: workflow, error } = await supabase
        .from("consignment_workflows")
        .insert({
          ...data,
          consignment_ref: ref,
          current_stage: "documents_received",
          documents_received_at: new Date().toISOString(),
          documents_received_by: userId,
          created_by: userId,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Add timeline event
      await supabase.from("workflow_timeline").insert({
        workflow_id: (workflow as any).id,
        event_type: "stage_change",
        stage: "documents_received",
        title: "Documents Received",
        description: `Consignment ${ref} created by ${profile?.full_name || "System"}`,
        performed_by: userId,
        performed_by_name: profile?.full_name || "System",
      } as any);

      return workflow as unknown as ConsignmentWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
      toast.success("Consignment created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdvanceWorkflowStage() {
  const queryClient = useQueryClient();
  const { session, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      workflowId,
      currentStage,
      additionalData,
    }: {
      workflowId: string;
      currentStage: WorkflowStage;
      additionalData?: Record<string, unknown>;
    }) => {
      const nextStage = getNextStage(currentStage);
      if (!nextStage) throw new Error("Already at final stage");

      const userId = session?.user?.id;
      const now = new Date().toISOString();

      const updateData: Record<string, unknown> = {
        current_stage: nextStage,
        stage_started_at: now,
        [getStageTimestampField(nextStage)]: now,
        [getStageByField(currentStage)]: userId,
        ...additionalData,
      };

      const { data: workflow, error } = await supabase
        .from("consignment_workflows")
        .update(updateData as any)
        .eq("id", workflowId)
        .select()
        .single();
      if (error) throw error;

      const stageInfo = WORKFLOW_STAGES[STAGE_INDEX[nextStage]];

      // Timeline event
      await supabase.from("workflow_timeline").insert({
        workflow_id: workflowId,
        event_type: "stage_change",
        stage: nextStage,
        title: `Stage: ${stageInfo.label}`,
        description: `Advanced to ${stageInfo.label} by ${profile?.full_name || "System"}`,
        performed_by: userId,
        performed_by_name: profile?.full_name || "System",
      } as any);

      // Notification to target department
      const wf = workflow as unknown as ConsignmentWorkflow;
      const notifMessages: Record<string, { title: string; message: string; action: string }> = {
        documentation_processing: {
          title: "New Shipment Documents Received",
          message: `Consignment ${wf.consignment_ref} - ${wf.client_name}: Prepare customs declaration.`,
          action: "Prepare customs documentation",
        },
        customs_declaration: {
          title: "Documentation Ready for Customs",
          message: `Consignment ${wf.consignment_ref}: Documentation processing completed. File customs declaration.`,
          action: "File customs declaration",
        },
        duty_payment: {
          title: "Customs Declaration Filed",
          message: `Consignment ${wf.consignment_ref}: Declaration filed. Process duty payment.`,
          action: "Process duty payment",
        },
        port_processing: {
          title: "Duty Paid - Port Processing",
          message: `Consignment ${wf.consignment_ref}: Duty paid. Process port operations and cargo release.`,
          action: "Process port operations",
        },
        cargo_release: {
          title: "Container Ready for Release",
          message: `Consignment ${wf.consignment_ref}: Port processing complete. Release container.`,
          action: "Release container",
        },
        truck_assignment: {
          title: "Container Released - Assign Truck",
          message: `Consignment ${wf.consignment_ref}: Container released. Assign truck for delivery.`,
          action: "Assign truck and driver",
        },
        delivery_in_transit: {
          title: "Truck Assigned - Delivery Started",
          message: `Consignment ${wf.consignment_ref}: Truck dispatched for delivery.`,
          action: "Monitor delivery",
        },
        delivery_completed: {
          title: "Delivery Completed",
          message: `Consignment ${wf.consignment_ref}: Cargo delivered successfully.`,
          action: "Review completion",
        },
      };

      const notif = notifMessages[nextStage];
      if (notif) {
        await supabase.from("workflow_notifications").insert({
          workflow_id: workflowId,
          consignment_ref: wf.consignment_ref,
          target_department: stageInfo.department,
          title: notif.title,
          message: notif.message,
          action_required: notif.action,
          priority: wf.is_urgent ? "high" : "medium",
          action_url: `/consignments/${workflowId}`,
        } as any);
      }

      return workflow as unknown as ConsignmentWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-notifications"] });
      toast.success("Stage advanced successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadWorkflowDocument() {
  const queryClient = useQueryClient();
  const { session, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      workflowId,
      file,
      documentType,
      stage,
      notes,
    }: {
      workflowId: string;
      file: File;
      documentType: string;
      stage: string;
      notes?: string;
    }) => {
      const userId = session?.user?.id;
      const filePath = `${workflowId}/${Date.now()}_${file.name}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("workflow-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("workflow-documents")
        .getPublicUrl(filePath);

      // Insert document record
      const { data: doc, error } = await supabase
        .from("workflow_documents")
        .insert({
          workflow_id: workflowId,
          document_type: documentType,
          document_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          stage,
          uploaded_by: userId,
          uploaded_by_name: profile?.full_name || "System",
          notes,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Timeline event
      await supabase.from("workflow_timeline").insert({
        workflow_id: workflowId,
        event_type: "document_upload",
        stage,
        title: `Document Uploaded: ${file.name}`,
        description: `${documentType} uploaded by ${profile?.full_name || "System"}`,
        performed_by: userId,
        performed_by_name: profile?.full_name || "System",
      } as any);

      return doc as unknown as WorkflowDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-documents"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-timeline"] });
      toast.success("Document uploaded successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("workflow_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() } as any)
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-notifications"] });
    },
  });
}

export function useUpdateConsignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ConsignmentWorkflow>;
    }) => {
      const { data: updated, error } = await supabase
        .from("consignment_workflows")
        .update(data as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as unknown as ConsignmentWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignment-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["consignment-workflow"] });
      toast.success("Consignment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
