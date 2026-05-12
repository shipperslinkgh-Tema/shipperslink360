export type VoucherType = "payment" | "receipt" | "journal" | "contra";
export type VoucherStatus = "draft" | "posted" | "cancelled";
export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parent_id: string | null;
  currency: string;
  is_active: boolean;
}

export interface VoucherLine {
  id?: string;
  voucher_id?: string;
  line_no?: number;
  account_id: string;
  debit: number;
  credit: number;
  description?: string | null;
}

export interface Voucher {
  id: string;
  voucher_no: string | null;
  voucher_type: VoucherType;
  voucher_date: string;
  status: VoucherStatus;
  reference: string | null;
  narration: string | null;
  party_name: string | null;
  payment_method: string | null;
  consignment_id: string | null;
  customer_id: string | null;
  invoice_id: string | null;
  bank_connection_id: string | null;
  currency: string;
  exchange_rate: number;
  total_amount: number;
  ghs_equivalent: number;
  posted_at: string | null;
  posted_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  voucher_id: string;
  account_id: string;
  entry_date: string;
  debit: number;
  credit: number;
  currency: string;
  ghs_equivalent: number;
  consignment_id: string | null;
  customer_id: string | null;
  description: string | null;
}

export const VOUCHER_TYPE_LABEL: Record<VoucherType, string> = {
  payment: "Payment Voucher",
  receipt: "Receipt Voucher",
  journal: "Journal Voucher",
  contra: "Contra Voucher",
};

export const VOUCHER_TYPE_PREFIX: Record<VoucherType, string> = {
  payment: "PV",
  receipt: "RV",
  journal: "JV",
  contra: "CV",
};

export const CURRENCIES = ["GHS", "USD", "EUR", "GBP"] as const;
