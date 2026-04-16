import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";
import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PLDashboard } from "@/components/finance/PLDashboard";
import { EnhancedInvoicesTable } from "@/components/finance/EnhancedInvoicesTable";
import { JobCostingTable } from "@/components/finance/JobCostingTable";
import { PayablesTable } from "@/components/finance/PayablesTable";
import { ReceivablesTable } from "@/components/finance/ReceivablesTable";
import { CreditControlTable } from "@/components/finance/CreditControlTable";
import { AccountsTable } from "@/components/finance/AccountsTable";
import { ExpensesTable } from "@/components/finance/ExpensesTable";
import { TaxFilingTable } from "@/components/finance/TaxFilingTable";
import { DirectorTaxTable } from "@/components/finance/DirectorTaxTable";
import { RegistrarRenewalTable } from "@/components/finance/RegistrarRenewalTable";
import { InvoiceFormDialog } from "@/components/finance/InvoiceFormDialog";
import { PayableFormDialog } from "@/components/finance/PayableFormDialog";
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog";
import { TaxFilingFormDialog } from "@/components/finance/TaxFilingFormDialog";
import { RenewalFormDialog } from "@/components/finance/RenewalFormDialog";
import { PaymentFormDialog } from "@/components/finance/PaymentFormDialog";
import { JobCostFormDialog } from "@/components/finance/JobCostFormDialog";
import { usePLData } from "@/hooks/usePLData";
import {
  useFinanceInvoices,
  useJobProfitability,
  useFinancePayables,
  useFinanceReceivables,
  useCustomerCredits,
  useExchangeRates,
  useOfficeAccounts,
  useFinanceExpenses,
  useTaxFilings,
  useRegistrarRenewals,
} from "@/hooks/useFinanceData";
import {
  useUpdateInvoiceStatus,
  useUpdatePayableStatus,
  useUpdateExpenseStatus,
  useUpdateTaxFiling,
  useUpdateRenewal,
  useUpdateCustomerCredit,
  useUpdateReceivable,
} from "@/hooks/useFinanceMutations";

import {
  Plus,
  Search,
  Download,
  Filter,
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  TrendingUp,
  Calculator,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  Building2,
  Shield,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [payableStatusFilter, setPayableStatusFilter] = useState<string>("all");

  // Dialog states
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showJobCostForm, setShowJobCostForm] = useState(false);
  const [paymentType, setPaymentType] = useState<"incoming" | "outgoing">("incoming");

  // Live data from database
  const { data: invoices = [] } = useFinanceInvoices();
  const { data: jobProfitability = [] } = useJobProfitability();
  const { data: payables = [] } = useFinancePayables();
  const { data: receivables = [] } = useFinanceReceivables();
  const { data: customerCredits = [] } = useCustomerCredits();
  const { data: exchangeRates = [] } = useExchangeRates();
  const { data: officeAccounts = [] } = useOfficeAccounts();
  const { data: officeExpenses = [] } = useFinanceExpenses();
  const { data: taxFilings = [] } = useTaxFilings();
  const { data: registrarRenewals = [] } = useRegistrarRenewals();

  // Mutations
  const updateInvoiceStatus = useUpdateInvoiceStatus();
  const updatePayableStatus = useUpdatePayableStatus();
  const updateExpenseStatus = useUpdateExpenseStatus();
  const updateTaxFiling = useUpdateTaxFiling();
  const updateRenewal = useUpdateRenewal();

  // Live P&L data from database
  const { metrics: liveMetrics, agingSummary: liveAgingSummary, revenueByService, costBreakdown, expenseBreakdown, isLoading: plLoading } = usePLData();

  // TODO: Get from auth context
  const userName = "Accountant";

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.jobRef?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType =
        invoiceTypeFilter === "all" || invoice.invoiceType === invoiceTypeFilter;
      const matchesStatus =
        invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, searchTerm, invoiceTypeFilter, invoiceStatusFilter]);

  const filteredPayables = useMemo(() => {
    return payables.filter((payable) => {
      const matchesSearch =
        payable.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payable.payableRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        payableStatusFilter === "all" || payable.status === payableStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payables, searchTerm, payableStatusFilter]);

  const handleNewInvoice = () => setShowInvoiceForm(true);
  const handleRecordPayment = () => { setPaymentType("incoming"); setShowPaymentForm(true); };
  const handleRecordReceipt = () => { setPaymentType("incoming"); setShowPaymentForm(true); };
  const handleNewPayable = () => setShowPayableForm(true);
  const handleRecordDuty = () => setShowPayableForm(true);
  const handleExportReport = () => toast.success("Generating financial report...");

  // Invoice actions
  const handleSendInvoice = (invoiceId: string) => {
    updateInvoiceStatus.mutate({ id: invoiceId, status: "sent" });
  };
  const handleApproveInvoice = (invoiceId: string) => {
    updateInvoiceStatus.mutate({ id: invoiceId, status: "sent", approved_by: userName });
  };

  // Payable actions
  const handleApprovePayable = (id: string) => {
    updatePayableStatus.mutate({ id, status: "approved", approved_by: userName });
  };
  const handlePayPayable = (id: string) => {
    updatePayableStatus.mutate({ id, status: "paid", paid_date: new Date().toISOString().split("T")[0] });
  };

  // Expense actions
  const handleApproveExpense = (id: string) => {
    updateExpenseStatus.mutate({ id, status: "approved", approved_by: userName });
  };

  // Calculate alerts for display
  const alertsCount = 
    (liveMetrics.overdueInvoices > 0 ? 1 : 0) +
    (liveMetrics.overduePayables > 0 ? 1 : 0) +
    taxFilings.filter(t => t.status === "overdue").length +
    registrarRenewals.filter(r => r.status === "expired" || r.status === "expiring_soon").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Accounting
            </h1>
            <Badge variant="outline" className="text-xs">
              Shippers Link Agencies
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Integrated financial management with multi-currency support (GHS, USD, EUR, GBP, CNY)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {alertsCount > 0 && (
            <Button variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {alertsCount} Alerts
            </Button>
          )}
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleNewInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <FinanceQuickActions
        onNewInvoice={handleNewInvoice}
        onRecordPayment={handleRecordPayment}
        onRecordReceipt={handleRecordReceipt}
        onNewPayable={handleNewPayable}
        onRecordDuty={handleRecordDuty}
        onExportReport={handleExportReport}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoicing</span>
          </TabsTrigger>
          <TabsTrigger value="job-costing" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Job P&L</span>
          </TabsTrigger>
          <TabsTrigger value="payables" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Payables</span>
          </TabsTrigger>
          <TabsTrigger value="receivables" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Receivables</span>
          </TabsTrigger>
          <TabsTrigger value="credit" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Credit Control</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Taxes</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboard 
            metrics={liveMetrics} 
            agingSummary={liveAgingSummary}
            exchangeRates={exchangeRates}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Client Invoicing</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Proforma, commercial invoices, and credit/debit notes for all services
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setPaymentType("incoming"); setShowPaymentForm(true); }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button size="sm" onClick={handleNewInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice, customer, B/L, AWB, or job..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={invoiceTypeFilter} onValueChange={setInvoiceTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="proforma">Proforma</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="credit_note">Credit Note</SelectItem>
                    <SelectItem value="debit_note">Debit Note</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partially_paid">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EnhancedInvoicesTable 
                invoices={filteredInvoices}
                onSend={handleSendInvoice}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-costing">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Job Profitability & Costing</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track revenue, costs, and margins per shipment, consolidation, or container
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowJobCostForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cost
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <JobCostingTable jobs={jobProfitability} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Vendor & Shipping Line Payables</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage payments to shipping lines, GPHA, customs, and transport providers
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setPaymentType("outgoing"); setShowPaymentForm(true); }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button size="sm" onClick={handleNewPayable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payable
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors, ICUMS ref, B/L, container..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={payableStatusFilter} onValueChange={setPayableStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PayablesTable 
                payables={filteredPayables}
                onApprove={handleApprovePayable}
                onPay={handlePayPayable}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Accounts Receivable & Aging</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track outstanding invoices and aging analysis for collection management
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setPaymentType("incoming"); setShowPaymentForm(true); }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReceivablesTable 
                receivables={receivables}
                onRecordPayment={(invoiceId) => { setPaymentType("incoming"); setShowPaymentForm(true); }}
                onContactCustomer={(customerId) => toast.info(`Opening contact for customer ${customerId}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Credit Control</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage customer credit limits, utilization, and payment history
              </p>
            </CardHeader>
            <CardContent>
              <CreditControlTable credits={customerCredits} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <PLDashboard 
            metrics={liveMetrics}
            agingSummary={liveAgingSummary}
            revenueByService={revenueByService}
            costBreakdown={costBreakdown}
            expenseBreakdown={expenseBreakdown}
            isLoading={plLoading}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Office Accounts</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bank accounts, petty cash, and mobile money balances
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reconcile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AccountsTable accounts={officeAccounts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Office Expenses & Overheads</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track rent, utilities, supplies, maintenance, and other operational costs
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowExpenseForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ExpensesTable expenses={officeExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Tax Filings & Compliance</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    GRA tax filings including VAT, PAYE, Corporate, Withholding, and Customs Duty
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowTaxForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TaxFilingTable filings={taxFilings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Directors Tax Reminders
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personal tax obligations for company directors
                </p>
              </CardHeader>
              <CardContent>
                <DirectorTaxTable reminders={[]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Registrar Renewals
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Business registrations, licenses, and compliance certificates
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowRenewalForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RegistrarRenewalTable renewals={registrarRenewals} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Forms */}
      <InvoiceFormDialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm} userName={userName} />
      <PayableFormDialog open={showPayableForm} onOpenChange={setShowPayableForm} userName={userName} />
      <ExpenseFormDialog open={showExpenseForm} onOpenChange={setShowExpenseForm} userName={userName} />
      <TaxFilingFormDialog open={showTaxForm} onOpenChange={setShowTaxForm} />
      <RenewalFormDialog open={showRenewalForm} onOpenChange={setShowRenewalForm} />
      <PaymentFormDialog open={showPaymentForm} onOpenChange={setShowPaymentForm} userName={userName} defaultType={paymentType} />
      <JobCostFormDialog open={showJobCostForm} onOpenChange={setShowJobCostForm} userName={userName} />
    </div>
  );
};

export default Finance;
