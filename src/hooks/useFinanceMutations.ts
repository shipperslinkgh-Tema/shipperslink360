import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FINANCE_QUERY_KEYS = [
  "finance-invoices", "finance-payables", "finance-receivables",
  "finance-expenses", "finance-payments", "job-profitability",
  "tax-filings", "registrar-renewals", "customer-credits",
  "office-accounts", "pl-data",
];

function useInvalidateFinance() {
  const qc = useQueryClient();
  return () => FINANCE_QUERY_KEYS.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
}

// ── Invoice Mutations ────────────────────────────────
export function useCreateInvoice() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      invoice_number: string; invoice_type: string; customer: string; customer_id: string;
      service_type: string; currency: string; exchange_rate: number;
      subtotal: number; tax_amount: number; total_amount: number;
      ghs_equivalent: number; due_date: string; issue_date: string;
      description?: string; notes?: string; job_ref?: string;
      shipment_ref?: string; consolidation_ref?: string; created_by: string;
    }) => {
      const { error } = await supabase.from("finance_invoices").insert(data);
      if (error) throw error;
      // Auto-create receivable
      await supabase.from("finance_receivables").insert({
        invoice_number: data.invoice_number,
        customer: data.customer,
        customer_id: data.customer_id,
        original_amount: data.total_amount,
        outstanding_amount: data.total_amount,
        currency: data.currency,
        ghs_equivalent: data.ghs_equivalent,
        issue_date: data.issue_date,
        due_date: data.due_date,
      });
    },
    onSuccess: () => { invalidate(); toast.success("Invoice created successfully"); },
    onError: (e: any) => toast.error("Failed to create invoice: " + e.message),
  });
}

export function useUpdateInvoiceStatus() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, status, approved_by }: { id: string; status: string; approved_by?: string }) => {
      const update: any = { status };
      if (approved_by) { update.approved_by = approved_by; update.approval_date = new Date().toISOString().split('T')[0]; }
      const { error } = await supabase.from("finance_invoices").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Invoice status updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Payable Mutations ────────────────────────────────
export function useCreatePayable() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      payable_ref: string; vendor: string; vendor_category: string; description: string;
      amount: number; currency: string; exchange_rate: number; ghs_equivalent: number;
      due_date: string; job_ref?: string; shipment_ref?: string; consolidation_ref?: string;
      invoice_number?: string; notes?: string; created_by: string;
    }) => {
      const { error } = await supabase.from("finance_payables").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Payable created successfully"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdatePayableStatus() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, status, approved_by, paid_date, payment_method }: {
      id: string; status: string; approved_by?: string; paid_date?: string; payment_method?: string;
    }) => {
      const update: any = { status };
      if (approved_by) { update.approved_by = approved_by; update.approval_status = "approved"; update.approval_date = new Date().toISOString().split('T')[0]; }
      if (paid_date) { update.paid_date = paid_date; }
      if (payment_method) { update.payment_method = payment_method; }
      const { error } = await supabase.from("finance_payables").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Payable updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Expense Mutations ────────────────────────────────
export function useCreateExpense() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      expense_ref: string; category: string; description: string;
      amount: number; currency: string; exchange_rate: number; ghs_equivalent: number;
      expense_date: string; requested_by: string; notes?: string;
    }) => {
      const { error } = await supabase.from("finance_expenses").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Expense recorded successfully"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateExpenseStatus() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, status, approved_by }: { id: string; status: string; approved_by?: string }) => {
      const update: any = { status };
      if (approved_by) update.approved_by = approved_by;
      if (status === "paid") update.paid_date = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from("finance_expenses").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Expense updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Tax Filing Mutations ────────────────────────────────
export function useCreateTaxFiling() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      tax_type: string; period: string; due_date: string;
      amount: number; currency: string; notes?: string;
    }) => {
      const { error } = await supabase.from("tax_filings").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Tax filing created"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTaxFiling() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; filing_date?: string; payment_ref?: string; reference_number?: string }) => {
      const { error } = await supabase.from("tax_filings").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Tax filing updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Registrar Renewal Mutations ──────────────────────
export function useCreateRenewal() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      registration_type: string; registrar_name: string; description: string;
      expiry_date: string; renewal_fee: number; currency: string;
      certificate_number?: string; notes?: string;
    }) => {
      const { error } = await supabase.from("registrar_renewals").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Renewal created"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateRenewal() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; renewal_date?: string; expiry_date?: string }) => {
      const { error } = await supabase.from("registrar_renewals").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Renewal updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Payment Mutations ────────────────────────────────
export function useRecordPayment() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      payment_ref: string; type: string; category: string;
      amount: number; currency: string; exchange_rate: number; ghs_equivalent: number;
      method: string; payment_date: string; description: string;
      customer?: string; customer_id?: string; vendor?: string;
      invoice_id?: string; invoice_number?: string;
      payable_id?: string; payable_ref?: string;
      bank_account?: string; created_by: string;
    }) => {
      const { error } = await supabase.from("finance_payments").insert(data);
      if (error) throw error;
      // If incoming payment against invoice, update invoice paid_amount
      if (data.invoice_id && data.type === "incoming") {
        const { data: inv } = await supabase.from("finance_invoices").select("paid_amount, total_amount").eq("id", data.invoice_id).single();
        if (inv) {
          const newPaid = (inv.paid_amount || 0) + data.amount;
          const newStatus = newPaid >= inv.total_amount ? "paid" : "partially_paid";
          await supabase.from("finance_invoices").update({ paid_amount: newPaid, status: newStatus, paid_date: data.payment_date }).eq("id", data.invoice_id);
          // Update receivable too
          if (data.invoice_number) {
            await supabase.from("finance_receivables").update({
              paid_amount: newPaid,
              outstanding_amount: inv.total_amount - newPaid,
              last_payment_date: data.payment_date,
              status: newPaid >= inv.total_amount ? "current" : "overdue",
            }).eq("invoice_number", data.invoice_number);
          }
        }
      }
      // If outgoing payment against payable, update payable
      if (data.payable_id && data.type === "outgoing") {
        const { data: pay } = await supabase.from("finance_payables").select("paid_amount, amount").eq("id", data.payable_id).single();
        if (pay) {
          const newPaid = (pay.paid_amount || 0) + data.amount;
          await supabase.from("finance_payables").update({
            paid_amount: newPaid,
            status: newPaid >= pay.amount ? "paid" : "approved",
            paid_date: data.payment_date,
          }).eq("id", data.payable_id);
        }
      }
    },
    onSuccess: () => { invalidate(); toast.success("Payment recorded successfully"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Job Cost Mutations ───────────────────────────────
export function useCreateJobCost() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (data: {
      job_ref: string; job_type: string; customer: string; customer_id: string;
      cost_category: string; description: string; amount: number;
      currency: string; exchange_rate: number; ghs_equivalent: number;
      vendor?: string; shipment_ref?: string; consolidation_ref?: string;
      created_by: string;
    }) => {
      const { error } = await supabase.from("finance_job_costs").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Job cost recorded"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Credit Control Mutations ─────────────────────────
export function useUpdateCustomerCredit() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, credit_limit, credit_status }: { id: string; credit_limit?: number; credit_status?: string }) => {
      const update: any = {};
      if (credit_limit !== undefined) update.credit_limit = credit_limit;
      if (credit_status) update.credit_status = credit_status;
      const { error } = await supabase.from("customers").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Customer credit updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Receivable Mutations ─────────────────────────────
export function useUpdateReceivable() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, collection_notes, last_contact_date, status }: {
      id: string; collection_notes?: string; last_contact_date?: string; status?: string;
    }) => {
      const update: any = {};
      if (collection_notes) update.collection_notes = collection_notes;
      if (last_contact_date) update.last_contact_date = last_contact_date;
      if (status) update.status = status;
      const { error } = await supabase.from("finance_receivables").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Receivable updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Ref Generators ───────────────────────────────────
export async function generateInvoiceRef(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("finance_invoices").select("*", { count: "exact", head: true });
  return `INV-${year}-${String((count || 0) + 1).padStart(4, "0")}`;
}

export async function generatePayableRef(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("finance_payables").select("*", { count: "exact", head: true });
  return `PAY-${year}-${String((count || 0) + 1).padStart(4, "0")}`;
}

export async function generateExpenseRef(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("finance_expenses").select("*", { count: "exact", head: true });
  return `EXP-${year}-${String((count || 0) + 1).padStart(4, "0")}`;
}

export async function generatePaymentRef(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase.from("finance_payments").select("*", { count: "exact", head: true });
  return `PMT-${year}-${String((count || 0) + 1).padStart(4, "0")}`;
}
