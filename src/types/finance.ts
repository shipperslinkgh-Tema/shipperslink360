// Currency types for multi-currency support
export type Currency = "GHS" | "USD" | "EUR" | "GBP" | "CNY";

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  date: string;
}

// Invoice types
export type InvoiceType = "proforma" | "commercial" | "credit_note" | "debit_note";
export type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled" | "disputed";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  costCategory: CostCategory;
  jobRef?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  customer: string;
  customerId: string;
  shipmentRef?: string;
  consolidationRef?: string;
  jobRef?: string;
  description: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: Currency;
  exchangeRate?: number;
  ghsEquivalent: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paidAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvalDate?: string;
  auditTrail: AuditEntry[];
}

// Cost categories for job costing
export type CostCategory = 
  | "freight_sea" 
  | "freight_air" 
  | "customs_duty" 
  | "customs_vat" 
  | "gpha_charges" 
  | "shipping_line_do" 
  | "demurrage" 
  | "detention" 
  | "trucking" 
  | "warehousing" 
  | "documentation" 
  | "handling" 
  | "insurance" 
  | "agency_fee" 
  | "other";

export interface JobCost {
  id: string;
  jobRef: string;
  jobType: "shipment" | "consolidation" | "container";
  shipmentRef?: string;
  consolidationRef?: string;
  containerNo?: string;
  customer: string;
  customerId: string;
  costCategory: CostCategory;
  description: string;
  vendor?: string;
  vendorId?: string;
  amount: number;
  currency: Currency;
  exchangeRate: number;
  ghsEquivalent: number;
  invoiceRef?: string;
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  dueDate?: string;
  paidDate?: string;
  paidAmount: number;
  isReimbursable: boolean;
  icumsRef?: string;
  gphaRef?: string;
  shippingLineRef?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  auditTrail: AuditEntry[];
}

// Job P&L and margin tracking
export interface JobProfitability {
  jobRef: string;
  jobType: "shipment" | "consolidation" | "container";
  customer: string;
  customerId: string;
  reference: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  costBreakdown: {
    category: CostCategory;
    amount: number;
    percentage: number;
  }[];
  revenueBreakdown: {
    invoiceNumber: string;
    amount: number;
    status: InvoiceStatus;
  }[];
  status: "in_progress" | "completed" | "closed";
  createdAt: string;
  closedAt?: string;
}

// Payables management
export type PayableStatus = "pending" | "approved" | "scheduled" | "paid" | "overdue" | "disputed";
export type VendorCategory = "shipping_line" | "customs" | "gpha" | "trucking" | "warehouse" | "agent" | "office" | "other";

export interface Payable {
  id: string;
  payableRef: string;
  vendor: string;
  vendorId: string;
  vendorCategory: VendorCategory;
  jobRef?: string;
  shipmentRef?: string;
  consolidationRef?: string;
  description: string;
  amount: number;
  currency: Currency;
  exchangeRate: number;
  ghsEquivalent: number;
  dueDate: string;
  paidDate?: string;
  paidAmount: number;
  status: PayableStatus;
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentMethod?: string;
  bankAccount?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvalDate?: string;
  icumsRef?: string;
  gphaRef?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  auditTrail: AuditEntry[];
}

// Receivables and aging analysis
export interface Receivable {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customer: string;
  customerId: string;
  originalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currency: Currency;
  ghsEquivalent: number;
  issueDate: string;
  dueDate: string;
  daysOutstanding: number;
  agingBucket: "current" | "1-30" | "31-60" | "61-90" | "90+";
  status: "current" | "overdue" | "disputed" | "written_off";
  lastPaymentDate?: string;
  lastContactDate?: string;
  collectionNotes?: string;
  creditStatus: "good" | "watch" | "hold" | "suspend";
}

export interface AgingSummary {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  total: number;
  customerCount: number;
}

export interface CustomerCredit {
  customerId: string;
  customerName: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilizationRate: number;
  creditStatus: "good" | "watch" | "hold" | "suspend";
  paymentHistory: {
    onTime: number;
    late: number;
    avgDaysLate: number;
  };
  lastReviewDate: string;
  nextReviewDate: string;
}

// Audit trail
export interface AuditEntry {
  id: string;
  action: "created" | "updated" | "approved" | "rejected" | "paid" | "cancelled" | "disputed" | "closed";
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

// Office accounts (enhanced)
export interface OfficeAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: "current" | "savings" | "petty_cash" | "mobile_money";
  currency: Currency;
  balance: number;
  availableBalance: number;
  pendingTransactions: number;
  status: "active" | "inactive" | "frozen";
  lastTransaction: string;
  lastReconciliation: string;
}

// Office expenses (enhanced)
export interface OfficeExpense {
  id: string;
  expenseRef: string;
  category: "rent" | "utilities" | "supplies" | "maintenance" | "transport" | "salary" | "tax" | "insurance" | "other";
  description: string;
  amount: number;
  currency: Currency;
  accountId: string;
  accountName: string;
  status: "pending" | "approved" | "paid" | "rejected";
  requestedBy: string;
  approvedBy?: string;
  date: string;
  dueDate?: string;
  receiptUrl?: string;
  notes?: string;
  auditTrail: AuditEntry[];
}

// Tax filings (enhanced)
export interface TaxFiling {
  id: string;
  taxType: "VAT" | "PAYE" | "Corporate" | "Withholding" | "Customs Duty";
  period: string;
  dueDate: string;
  filingDate?: string;
  amount: number;
  currency: Currency;
  status: "pending" | "filed" | "paid" | "overdue";
  referenceNumber?: string;
  paymentRef?: string;
  notes?: string;
  auditTrail: AuditEntry[];
}

// Directors Tax Reminders
export interface DirectorTaxReminder {
  id: string;
  directorName: string;
  taxType: "Income Tax" | "Capital Gains" | "Dividend Tax" | "Personal Relief";
  description: string;
  dueDate: string;
  filingDate?: string;
  amount: number;
  currency: Currency;
  status: "pending" | "filed" | "paid" | "overdue";
  referenceNumber?: string;
  notes?: string;
}

// Registrar Renewals
export interface RegistrarRenewal {
  id: string;
  registrationType: "Annual Returns" | "Business Registration" | "Tax Clearance" | "SSNIT Certificate" | "Fire Certificate" | "EPA Permit" | "Operating License";
  registrarName: string;
  description: string;
  expiryDate: string;
  renewalDate?: string;
  renewalFee: number;
  currency: Currency;
  status: "active" | "expiring_soon" | "expired" | "renewed";
  certificateNumber?: string;
  notes?: string;
}

// Payments (enhanced)
export interface Payment {
  id: string;
  paymentRef: string;
  invoiceId?: string;
  invoiceNumber?: string;
  payableId?: string;
  payableRef?: string;
  customer?: string;
  vendor?: string;
  type: "incoming" | "outgoing";
  category: CostCategory | "office" | "salary" | "tax";
  amount: number;
  currency: Currency;
  exchangeRate: number;
  ghsEquivalent: number;
  method: "bank_transfer" | "cheque" | "cash" | "mobile_money" | "letter_of_credit";
  bankAccount?: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
  date: string;
  valueDate?: string;
  description: string;
  reference?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  createdBy: string;
  auditTrail: AuditEntry[];
}

// Financial summary (enhanced)
export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  pendingTaxes: number;
  cashBalance: number;
  jobsInProgress: number;
  completedJobs: number;
}

// Dashboard metrics
export interface FinanceDashboardMetrics {
  mtdRevenue: number;
  mtdCosts: number;
  mtdProfit: number;
  mtdMargin: number;
  ytdRevenue: number;
  ytdCosts: number;
  ytdProfit: number;
  ytdMargin: number;
  pendingInvoices: number;
  overdueInvoices: number;
  pendingPayables: number;
  overduePayables: number;
  cashPosition: number;
  dso: number; // Days Sales Outstanding
  dpo: number; // Days Payables Outstanding
}
