// Consignment Workflow Types

export type WorkflowStage =
  | 'documents_received'
  | 'documentation_processing'
  | 'customs_declaration'
  | 'duty_payment'
  | 'port_processing'
  | 'cargo_release'
  | 'truck_assignment'
  | 'delivery_in_transit'
  | 'delivery_completed';

export const WORKFLOW_STAGES: { key: WorkflowStage; label: string; department: string; icon: string }[] = [
  { key: 'documents_received', label: 'Documents Received', department: 'management', icon: 'FileText' },
  { key: 'documentation_processing', label: 'Documentation Processing', department: 'documentation', icon: 'ClipboardList' },
  { key: 'customs_declaration', label: 'Customs Declaration', department: 'documentation', icon: 'Shield' },
  { key: 'duty_payment', label: 'Duty Payment', department: 'accounts', icon: 'DollarSign' },
  { key: 'port_processing', label: 'Port Processing', department: 'operations', icon: 'Anchor' },
  { key: 'cargo_release', label: 'Cargo Release', department: 'operations', icon: 'PackageCheck' },
  { key: 'truck_assignment', label: 'Truck Assignment', department: 'trucking', icon: 'Truck' },
  { key: 'delivery_in_transit', label: 'Delivery In Transit', department: 'trucking', icon: 'Navigation' },
  { key: 'delivery_completed', label: 'Delivery Completed', department: 'trucking', icon: 'CheckCircle' },
];

export const STAGE_INDEX: Record<WorkflowStage, number> = {
  documents_received: 0,
  documentation_processing: 1,
  customs_declaration: 2,
  duty_payment: 3,
  port_processing: 4,
  cargo_release: 5,
  truck_assignment: 6,
  delivery_in_transit: 7,
  delivery_completed: 8,
};

export const DOCUMENT_TYPES = [
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'certificate_of_origin', label: 'Certificate of Origin' },
  { value: 'idf', label: 'IDF' },
  { value: 'bill_of_entry', label: 'Bill of Entry (BOE)' },
  { value: 'duty_receipt', label: 'Duty Receipt' },
  { value: 'assessment_notice', label: 'Assessment Notice' },
  { value: 'delivery_order', label: 'Delivery Order' },
  { value: 'shipping_line_invoice', label: 'Shipping Line Invoice' },
  { value: 'terminal_receipt', label: 'Terminal Receipt' },
  { value: 'interchange_document', label: 'Interchange Document' },
  { value: 'customs_payment_receipt', label: 'Customs Payment Receipt' },
  { value: 'company_invoice', label: 'Company Invoice' },
  { value: 'other', label: 'Other' },
] as const;

export interface ConsignmentWorkflow {
  id: string;
  consignment_ref: string;
  client_name: string;
  client_contact: string | null;
  client_id: string | null;
  supplier_name: string | null;
  origin_country: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  container_number: string | null;
  bl_number: string | null;
  awb_number: string | null;
  cargo_description: string | null;
  weight_kg: number | null;
  volume_cbm: number | null;
  shipment_type: string;
  eta: string | null;
  vessel_name: string | null;
  voyage_number: string | null;
  incoterms: string | null;
  current_stage: WorkflowStage;
  stage_started_at: string | null;
  documents_received_at: string | null;
  documents_received_by: string | null;
  documentation_started_at: string | null;
  documentation_completed_at: string | null;
  documentation_completed_by: string | null;
  customs_declared_at: string | null;
  customs_declared_by: string | null;
  duty_paid_at: string | null;
  duty_paid_by: string | null;
  port_processing_at: string | null;
  port_processing_by: string | null;
  cargo_released_at: string | null;
  cargo_released_by: string | null;
  truck_assigned_at: string | null;
  truck_assigned_by: string | null;
  delivery_started_at: string | null;
  delivery_completed_at: string | null;
  delivery_completed_by: string | null;
  consolidation_id: string | null;
  trucking_trip_id: string | null;
  icums_declaration_number: string | null;
  hs_code: string | null;
  fob_value: number | null;
  freight_value: number | null;
  insurance_value: number | null;
  cif_value: number | null;
  duty_amount: number | null;
  delivery_order_number: string | null;
  free_days: number | null;
  free_days_start: string | null;
  shipping_line: string | null;
  terminal: string | null;
  terminal_charges: number | null;
  shipping_line_charges: number | null;
  assigned_officer: string | null;
  assigned_officer_id: string | null;
  notes: string | null;
  is_urgent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowDocument {
  id: string;
  workflow_id: string;
  document_type: string;
  document_name: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  stage: string;
  uploaded_by: string;
  uploaded_by_name: string;
  notes: string | null;
  created_at: string;
}

export interface WorkflowTimelineEvent {
  id: string;
  workflow_id: string;
  event_type: string;
  stage: string | null;
  title: string;
  description: string | null;
  performed_by: string | null;
  performed_by_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface WorkflowNotification {
  id: string;
  workflow_id: string;
  consignment_ref: string;
  target_department: string;
  target_user_id: string | null;
  title: string;
  message: string;
  priority: string;
  action_required: string | null;
  action_url: string | null;
  is_read: boolean;
  is_actioned: boolean;
  read_at: string | null;
  actioned_at: string | null;
  created_at: string;
}
