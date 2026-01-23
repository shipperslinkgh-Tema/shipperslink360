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
import { FinanceStats } from "@/components/finance/FinanceStats";
import { AccountsTable } from "@/components/finance/AccountsTable";
import { ExpensesTable } from "@/components/finance/ExpensesTable";
import { TaxFilingTable } from "@/components/finance/TaxFilingTable";
import { InvoicesTable } from "@/components/finance/InvoicesTable";
import { invoices, payments, officeAccounts, officeExpenses, taxFilings } from "@/data/financeData";
import { Plus, Search, Download, Filter, Wallet, FileText, Receipt, Calculator } from "lucide-react";

const Finance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.type === "incoming" && p.status === "completed")
      .reduce((acc, p) => acc + p.amount, 0);

    const totalExpenses = payments
      .filter((p) => p.type === "outgoing" && p.status === "completed")
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingInvoices = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((acc, i) => acc + i.totalAmount, 0);

    const pendingTaxes = taxFilings
      .filter((t) => t.status === "pending" || t.status === "overdue")
      .reduce((acc, t) => acc + t.amount, 0);

    return { totalRevenue, totalExpenses, pendingInvoices, pendingTaxes };
  }, []);

  const filteredExpenses = useMemo(() => {
    return officeExpenses.filter((expense) => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.expenseRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = expenseStatusFilter === "all" || expense.status === expenseStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, expenseStatusFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, invoiceStatusFilter]);

  const totalAccountBalance = useMemo(() => {
    return officeAccounts
      .filter((a) => a.currency === "GHS" && a.status === "active")
      .reduce((acc, a) => acc + a.balance, 0);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, accounts, and tax compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      <FinanceStats {...stats} />

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Tax Filings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Office Accounts</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total GHS Balance: <span className="font-semibold text-foreground">
                    GH₵ {totalAccountBalance.toLocaleString()}
                  </span>
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </CardHeader>
            <CardContent>
              <AccountsTable accounts={officeAccounts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
              <InvoicesTable invoices={filteredInvoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Office Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={expenseStatusFilter} onValueChange={setExpenseStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </div>
              <ExpensesTable expenses={filteredExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Filings & Compliance</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Track VAT, PAYE, corporate taxes, and customs duties
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Filing
              </Button>
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
