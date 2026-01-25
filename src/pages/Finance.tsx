import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";
import { EnhancedInvoicesTable } from "@/components/finance/EnhancedInvoicesTable";
import { JobCostingTable } from "@/components/finance/JobCostingTable";
import { PayablesTable } from "@/components/finance/PayablesTable";
import { ReceivablesTable } from "@/components/finance/ReceivablesTable";
import { CreditControlTable } from "@/components/finance/CreditControlTable";
import { AccountsTable } from "@/components/finance/AccountsTable";
import { TaxFilingTable } from "@/components/finance/TaxFilingTable";
import {
  invoices,
  payments,
  officeAccounts,
  taxFilings,
  jobProfitability,
  payables,
  receivables,
  agingSummary,
  customerCredits,
  dashboardMetrics,
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
} from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Finance & Accounting
          </h1>
          <p className="text-muted-foreground">
            Integrated financial management for logistics operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

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
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Taxes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboard metrics={dashboardMetrics} agingSummary={agingSummary} />
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoicing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage proforma, commercial invoices, and credit/debit notes
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice, customer, or job..."
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
                Track revenue, costs, and margins per shipment or consolidation
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
              <CardTitle>Accounts Payable</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage vendor payments for shipping lines, customs, GPHA, and transport
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
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
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payable
                </Button>
              </div>
              <PayablesTable payables={filteredPayables} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable & Aging</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track outstanding invoices and aging analysis
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
                Manage customer credit limits and payment history
              </p>
            </CardHeader>
            <CardContent>
              <CreditControlTable credits={customerCredits} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Office Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsTable accounts={officeAccounts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Tax Filings & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxFilingTable filings={taxFilings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
