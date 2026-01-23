export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerId: string;
  shipmentRef?: string;
  description: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

export interface Payment {
  id: string;
  paymentRef: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customer?: string;
  vendor?: string;
  type: "incoming" | "outgoing";
  category: "shipment" | "trucking" | "customs" | "office" | "salary" | "tax" | "other";
  amount: number;
  method: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  status: "pending" | "completed" | "failed" | "refunded";
  date: string;
  description: string;
  reference?: string;
}

export interface OfficeAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: "current" | "savings" | "petty_cash" | "mobile_money";
  currency: string;
  balance: number;
  status: "active" | "inactive" | "frozen";
  lastTransaction: string;
}

export interface OfficeExpense {
  id: string;
  expenseRef: string;
  category: "rent" | "utilities" | "supplies" | "maintenance" | "transport" | "salary" | "tax" | "insurance" | "other";
  description: string;
  amount: number;
  accountId: string;
  accountName: string;
  status: "pending" | "approved" | "paid" | "rejected";
  requestedBy: string;
  approvedBy?: string;
  date: string;
  dueDate?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface TaxFiling {
  id: string;
  taxType: "VAT" | "PAYE" | "Corporate" | "Withholding" | "Customs Duty";
  period: string;
  dueDate: string;
  filingDate?: string;
  amount: number;
  status: "pending" | "filed" | "paid" | "overdue";
  referenceNumber?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  pendingTaxes: number;
  cashBalance: number;
}
