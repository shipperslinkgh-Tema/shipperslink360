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
import {
  invoices,
  officeAccounts,
  officeExpenses,
  taxFilings,
  directorTaxReminders,
  registrarRenewals,
  jobProfitability,
  payables,
  receivables,
  agingSummary,
  customerCredits,
  dashboardMetrics,
  exchangeRates,
} from "@/data/financeData";
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
  }, [searchTerm, invoiceTypeFilter, invoiceStatusFilter]);

  const filteredPayables = useMemo(() => {
    return payables.filter((payable) => {
      const matchesSearch =
        payable.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payable.payableRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        payableStatusFilter === "all" || payable.status === payableStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, payableStatusFilter]);

  const handleNewInvoice = () => {
    toast.info("Opening new invoice form...");
  };

  const handleRecordPayment = () => {
    toast.info("Opening payment recorder...");
  };

  const handleRecordReceipt = () => {
    toast.info("Opening receipt generator...");
  };

  const handleNewPayable = () => {
    toast.info("Opening payable form...");
  };

  const handleRecordDuty = () => {
    toast.info("Opening ICUMS duty payment form...");
  };

  const handleExportReport = () => {
    toast.success("Generating financial report...");
  };

  // Calculate alerts for display
  const alertsCount = 
    (dashboardMetrics.overdueInvoices > 0 ? 1 : 0) +
    (dashboardMetrics.overduePayables > 0 ? 1 : 0) +
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
          <Button variant="outline">
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
            metrics={dashboardMetrics} 
            agingSummary={agingSummary}
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
                  <Button variant="outline" size="sm">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Batch Actions
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
              <EnhancedInvoicesTable invoices={filteredInvoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-costing">
          <Card>
            <CardHeader>
              <CardTitle>Job Profitability & Costing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track revenue, costs, and margins per shipment, consolidation, or container
              </p>
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
                  <Button variant="outline" size="sm">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Approve Selected
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
                onApprove={(id) => toast.success(`Payable ${id} approved`)}
                onPay={(id) => toast.info(`Processing payment for ${id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable & Aging</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track outstanding invoices and aging analysis for collection management
              </p>
            </CardHeader>
            <CardContent>
              <ReceivablesTable receivables={receivables} />
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
            metrics={dashboardMetrics}
            agingSummary={agingSummary}
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
                <Button size="sm">
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
              <CardTitle>Tax Filings & Compliance</CardTitle>
              <p className="text-sm text-muted-foreground">
                GRA tax filings including VAT, PAYE, Corporate, Withholding, and Customs Duty
              </p>
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
                <DirectorTaxTable reminders={directorTaxReminders} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Registrar Renewals
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Business registrations, licenses, and compliance certificates
                </p>
              </CardHeader>
              <CardContent>
                <RegistrarRenewalTable renewals={registrarRenewals} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
