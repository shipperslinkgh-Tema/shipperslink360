// Consolidation Types for SLAC Freight Forwarding System

export type ConsolidationType = "LCL" | "AIR";
export type ConsolidationStatus = "planning" | "receiving" | "stuffing" | "customs" | "in-transit" | "arrived" | "delivered" | "closed";
export type DocumentStatus = "draft" | "issued" | "submitted" | "approved" | "released";
export type CargoStatus = "pending" | "received" | "tallied" | "stored" | "loaded" | "dispatched";
export type CustomsStatus = "pending" | "submitted" | "assessment" | "payment" | "examination" | "released" | "held";

export interface Consolidation {
  id: string;
  consolidationRef: string;
  type: ConsolidationType;
  masterBLNumber?: string; // MBL for sea
  masterAWBNumber?: string; // MAWB for air
  origin: string;
  destination: string;
  vessel?: string;
  voyage?: string;
  flight?: string;
  carrier: string;
  etd: string;
  eta: string;
  status: ConsolidationStatus;
  containerNumber?: string;
  containerType?: "20GP" | "40GP" | "40HC" | "45HC";
  totalCBM: number;
  totalWeight: number;
  totalPackages: number;
  shippersCount: number;
  port: "Tema" | "Takoradi" | "Kotoka";
  warehouse?: string;
  stuffingDate?: string;
  cutoffDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipper {
  id: string;
  consolidationId: string;
  houseBLNumber?: string; // HBL for sea
  houseAWBNumber?: string; // HAWB for air
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyParty?: string;
  description: string;
  hsCode: string;
  hsDescription: string;
  packages: number;
  packageType: "cartons" | "pallets" | "drums" | "bags" | "crates" | "pieces";
  grossWeight: number;
  netWeight: number;
  cbm: number;
  cargoStatus: CargoStatus;
  customsStatus: CustomsStatus;
  icumsRef?: string;
  dutyAmount?: number;
  taxAmount?: number;
  freightCharge: number;
  handlingCharge: number;
  documentationFee: number;
  storageCharge: number;
  totalCharge: number;
  invoiced: boolean;
  invoiceNumber?: string;
  paid: boolean;
  remarks?: string;
  receivedDate?: string;
  receivedBy?: string;
  tallyConfirmed: boolean;
  releaseStatus: "pending" | "partial" | "released";
}

export interface CargoReceipt {
  id: string;
  receiptNumber: string;
  shipperId: string;
  consolidationId: string;
  receivedDate: string;
  receivedBy: string;
  warehouseLocation: string;
  packagesReceived: number;
  packagesDeclared: number;
  weightReceived: number;
  weightDeclared: number;
  condition: "good" | "damaged" | "partial";
  damageNotes?: string;
  photos?: string[];
  tallySheetRef?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface Document {
  id: string;
  consolidationId: string;
  shipperId?: string;
  documentType: "MBL" | "HBL" | "MAWB" | "HAWB" | "invoice" | "packing_list" | "customs_declaration" | "delivery_order" | "certificate_origin";
  documentNumber: string;
  status: DocumentStatus;
  issuedDate?: string;
  issuedBy?: string;
  submittedDate?: string;
  approvedDate?: string;
  fileUrl?: string;
  notes?: string;
}

export interface DemurrageRecord {
  id: string;
  consolidationId: string;
  containerNumber: string;
  freeTimeStart: string;
  freeTimeDays: number;
  freeTimeEnd: string;
  currentDays: number;
  demurrageDays: number;
  dailyRate: number;
  totalDemurrage: number;
  storageDays: number;
  storageRate: number;
  totalStorage: number;
  status: "within_free" | "demurrage" | "critical" | "paid";
  lastUpdated: string;
}

export interface ConsolidationInvoice {
  id: string;
  invoiceNumber: string;
  consolidationId: string;
  shipperId: string;
  shipperName: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: "GHS" | "USD";
  exchangeRate?: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface OperationalMetrics {
  totalConsolidations: number;
  activeConsolidations: number;
  pendingCustomsClearance: number;
  totalRevenue: number;
  averageTurnaroundDays: number;
  demurrageCharges: number;
  onTimeDeliveryRate: number;
  totalCBMHandled: number;
  totalShipments: number;
}

// Chat Types for Internal Communication
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderDepartment: "operations" | "documentation" | "finance" | "trucking" | "management" | "customs";
  content: string;
  timestamp: string;
  read: boolean;
  replyTo?: string;
  attachments?: string[];
  consolidationRef?: string;
  shipmentRef?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "department" | "consolidation" | "direct";
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}
