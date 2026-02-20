import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Invoice, JobProfitability, Payable, Receivable, AgingSummary,
  CustomerCredit, Payment, OfficeAccount, OfficeExpense,
  TaxFiling, DirectorTaxReminder, RegistrarRenewal, ExchangeRate,
} from "@/types/finance";

export function useFinanceInvoices() {
  return useQuery({
    queryKey: ["finance-invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("finance_invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((i: any): Invoice => ({
        id: i.id,
        invoiceNumber: i.invoice_number,
        invoiceType: i.invoice_type,
        customer: i.customer,
        customerId: i.customer_id,
        shipmentRef: i.shipment_ref,
        consolidationRef: i.consolidation_ref,
        jobRef: i.job_ref,
        description: i.description || "",
        lineItems: [],
        subtotal: Number(i.subtotal) || 0,
        taxAmount: Number(i.tax_amount) || 0,
        totalAmount: Number(i.total_amount) || 0,
        currency: i.currency || "GHS",
        exchangeRate: Number(i.exchange_rate) || 1,
        ghsEquivalent: Number(i.ghs_equivalent) || 0,
        status: i.status,
        issueDate: i.issue_date,
        dueDate: i.due_date,
        paidDate: i.paid_date,
        paidAmount: Number(i.paid_amount) || 0,
        paymentMethod: i.payment_method,
        notes: i.notes,
        createdBy: i.created_by || "",
        approvedBy: i.approved_by,
        approvalDate: i.approval_date,
        auditTrail: [],
      }));
    },
  });
}

export function useJobProfitability() {
  return useQuery({
    queryKey: ["job-profitability"],
    queryFn: async (): Promise<JobProfitability[]> => {
      const { data: costs, error } = await supabase
        .from("finance_job_costs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Group by job_ref
      const jobMap = new Map<string, any[]>();
      (costs || []).forEach((c: any) => {
        const existing = jobMap.get(c.job_ref) || [];
        existing.push(c);
        jobMap.set(c.job_ref, existing);
      });

      return Array.from(jobMap.entries()).map(([jobRef, items]): JobProfitability => {
        const first = items[0];
        const totalCosts = items.reduce((s: number, c: any) => s + Number(c.ghs_equivalent || 0), 0);
        return {
          jobRef,
          jobType: first.job_type || "shipment",
          customer: first.customer,
          customerId: first.customer_id,
          reference: first.shipment_ref || first.consolidation_ref || jobRef,
          totalRevenue: 0,
          totalCosts,
          grossProfit: -totalCosts,
          grossMargin: 0,
          costBreakdown: items.map((c: any) => ({
            category: c.cost_category,
            amount: Number(c.ghs_equivalent || 0),
            percentage: totalCosts > 0 ? (Number(c.ghs_equivalent || 0) / totalCosts * 100) : 0,
          })),
          revenueBreakdown: [],
          status: "in_progress",
          createdAt: first.created_at,
        };
      });
    },
  });
}

export function useFinancePayables() {
  return useQuery({
    queryKey: ["finance-payables"],
    queryFn: async (): Promise<Payable[]> => {
      const { data, error } = await supabase
        .from("finance_payables")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any): Payable => ({
        id: p.id,
        payableRef: p.payable_ref,
        vendor: p.vendor,
        vendorId: p.vendor_id || "",
        vendorCategory: p.vendor_category || "other",
        jobRef: p.job_ref,
        shipmentRef: p.shipment_ref,
        consolidationRef: p.consolidation_ref,
        description: p.description,
        amount: Number(p.amount) || 0,
        currency: p.currency || "GHS",
        exchangeRate: Number(p.exchange_rate) || 1,
        ghsEquivalent: Number(p.ghs_equivalent) || 0,
        dueDate: p.due_date || "",
        paidDate: p.paid_date,
        paidAmount: Number(p.paid_amount) || 0,
        status: p.status || "pending",
        invoiceNumber: p.invoice_number,
        invoiceDate: p.invoice_date,
        paymentMethod: p.payment_method,
        bankAccount: p.bank_account,
        approvalStatus: p.approval_status || "pending",
        approvedBy: p.approved_by,
        approvalDate: p.approval_date,
        icumsRef: p.icums_ref,
        gphaRef: p.gpha_ref,
        notes: p.notes,
        createdBy: p.created_by || "",
        createdAt: p.created_at,
        auditTrail: [],
      }));
    },
  });
}

export function useFinanceReceivables() {
  return useQuery({
    queryKey: ["finance-receivables"],
    queryFn: async (): Promise<Receivable[]> => {
      const { data, error } = await supabase
        .from("finance_receivables")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any): Receivable => ({
        id: r.id,
        invoiceId: r.invoice_id || "",
        invoiceNumber: r.invoice_number,
        customer: r.customer,
        customerId: r.customer_id,
        originalAmount: Number(r.original_amount) || 0,
        paidAmount: Number(r.paid_amount) || 0,
        outstandingAmount: Number(r.outstanding_amount) || 0,
        currency: r.currency || "GHS",
        ghsEquivalent: Number(r.ghs_equivalent) || 0,
        issueDate: r.issue_date,
        dueDate: r.due_date,
        daysOutstanding: r.days_outstanding || 0,
        agingBucket: r.aging_bucket || "current",
        status: r.status || "current",
        lastPaymentDate: r.last_payment_date,
        lastContactDate: r.last_contact_date,
        collectionNotes: r.collection_notes,
        creditStatus: r.credit_status || "good",
      }));
    },
  });
}

export function useAgingSummary(): AgingSummary {
  const { data: receivables } = useFinanceReceivables();
  const recs = receivables || [];
  return {
    current: recs.filter(r => r.agingBucket === "current").reduce((s, r) => s + r.outstandingAmount, 0),
    days1to30: recs.filter(r => r.agingBucket === "1-30").reduce((s, r) => s + r.outstandingAmount, 0),
    days31to60: recs.filter(r => r.agingBucket === "31-60").reduce((s, r) => s + r.outstandingAmount, 0),
    days61to90: recs.filter(r => r.agingBucket === "61-90").reduce((s, r) => s + r.outstandingAmount, 0),
    days90plus: recs.filter(r => r.agingBucket === "90+").reduce((s, r) => s + r.outstandingAmount, 0),
    total: recs.reduce((s, r) => s + r.outstandingAmount, 0),
    customerCount: new Set(recs.map(r => r.customerId)).size,
  };
}

export function useFinancePayments() {
  return useQuery({
    queryKey: ["finance-payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("finance_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any): Payment => ({
        id: p.id,
        paymentRef: p.payment_ref,
        invoiceId: p.invoice_id,
        invoiceNumber: p.invoice_number,
        payableId: p.payable_id,
        payableRef: p.payable_ref,
        customer: p.customer,
        vendor: p.vendor,
        type: p.type || "incoming",
        category: p.category || "other",
        amount: Number(p.amount) || 0,
        currency: p.currency || "GHS",
        exchangeRate: Number(p.exchange_rate) || 1,
        ghsEquivalent: Number(p.ghs_equivalent) || 0,
        method: p.method || "bank_transfer",
        bankAccount: p.bank_account,
        status: p.status || "pending",
        date: p.payment_date,
        valueDate: p.value_date,
        description: p.description || "",
        reference: p.transaction_ref,
        approvalStatus: p.approval_status || "pending",
        approvedBy: p.approved_by,
        createdBy: p.created_by || "",
        auditTrail: [],
      }));
    },
  });
}

export function useOfficeAccounts() {
  return useQuery({
    queryKey: ["office-accounts"],
    queryFn: async (): Promise<OfficeAccount[]> => {
      const { data, error } = await supabase
        .from("bank_connections")
        .select("*")
        .order("bank_display_name");
      if (error) throw error;
      return (data || []).map((a: any): OfficeAccount => ({
        id: a.id,
        accountName: a.account_name,
        accountNumber: a.account_number,
        bankName: a.bank_display_name,
        accountType: a.account_type || "current",
        currency: a.currency || "GHS",
        balance: Number(a.balance) || 0,
        availableBalance: Number(a.available_balance) || 0,
        pendingTransactions: 0,
        status: a.is_active ? "active" : "inactive",
        lastTransaction: a.last_sync_at || "",
        lastReconciliation: a.last_sync_at || "",
      }));
    },
  });
}

export function useFinanceExpenses() {
  return useQuery({
    queryKey: ["finance-expenses"],
    queryFn: async (): Promise<OfficeExpense[]> => {
      const { data, error } = await supabase
        .from("finance_expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any): OfficeExpense => ({
        id: e.id,
        expenseRef: e.expense_ref,
        category: e.category || "other",
        description: e.description,
        amount: Number(e.amount) || 0,
        currency: e.currency || "GHS",
        accountId: "",
        accountName: "",
        status: e.status || "pending",
        requestedBy: e.requested_by || "",
        approvedBy: e.approved_by,
        date: e.expense_date,
        dueDate: e.paid_date,
        auditTrail: [],
      }));
    },
  });
}

export function useTaxFilings() {
  return useQuery({
    queryKey: ["tax-filings"],
    queryFn: async (): Promise<TaxFiling[]> => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .order("due_date");
      if (error) throw error;
      return (data || []).map((t: any): TaxFiling => ({
        id: t.id,
        taxType: t.tax_type,
        period: t.period,
        dueDate: t.due_date,
        filingDate: t.filing_date,
        amount: Number(t.amount) || 0,
        currency: t.currency || "GHS",
        status: t.status || "pending",
        referenceNumber: t.reference_number,
        paymentRef: t.payment_ref,
        notes: t.notes,
        auditTrail: [],
      }));
    },
  });
}

export function useRegistrarRenewals() {
  return useQuery({
    queryKey: ["registrar-renewals"],
    queryFn: async (): Promise<RegistrarRenewal[]> => {
      const { data, error } = await supabase
        .from("registrar_renewals")
        .select("*")
        .order("expiry_date");
      if (error) throw error;
      return (data || []).map((r: any): RegistrarRenewal => ({
        id: r.id,
        registrationType: r.registration_type,
        registrarName: r.registrar_name,
        description: r.description || "",
        expiryDate: r.expiry_date,
        renewalDate: r.renewal_date,
        renewalFee: Number(r.renewal_fee) || 0,
        currency: r.currency || "GHS",
        status: r.status || "active",
        certificateNumber: r.certificate_number,
        notes: r.notes,
      }));
    },
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async (): Promise<ExchangeRate[]> => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .order("effective_date", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        // Return defaults if no rates in DB
        return [
          { from: "USD", to: "GHS", rate: 15.50, date: new Date().toISOString() },
          { from: "EUR", to: "GHS", rate: 16.80, date: new Date().toISOString() },
          { from: "GBP", to: "GHS", rate: 19.50, date: new Date().toISOString() },
          { from: "CNY", to: "GHS", rate: 2.15, date: new Date().toISOString() },
          { from: "GHS", to: "GHS", rate: 1, date: new Date().toISOString() },
        ];
      }
      return data.map((r: any): ExchangeRate => ({
        from: r.from_currency,
        to: r.to_currency || "GHS",
        rate: Number(r.rate),
        date: r.effective_date,
      }));
    },
  });
}

export function useCustomerCredits() {
  return useQuery({
    queryKey: ["customer-credits"],
    queryFn: async (): Promise<CustomerCredit[]> => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("status", "active")
        .order("company_name");
      if (error) throw error;
      return (data || []).map((c: any): CustomerCredit => ({
        customerId: c.id,
        customerName: c.company_name,
        creditLimit: Number(c.credit_limit) || 0,
        currentBalance: Number(c.outstanding_balance) || 0,
        availableCredit: (Number(c.credit_limit) || 0) - (Number(c.outstanding_balance) || 0),
        utilizationRate: Number(c.credit_limit) > 0
          ? (Number(c.outstanding_balance) || 0) / Number(c.credit_limit) * 100
          : 0,
        creditStatus: c.credit_status || "good",
        paymentHistory: { onTime: 0, late: 0, avgDaysLate: 0 },
        lastReviewDate: c.updated_at,
        nextReviewDate: "",
      }));
    },
  });
}
