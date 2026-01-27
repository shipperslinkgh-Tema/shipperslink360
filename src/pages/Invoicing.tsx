import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedInvoicesTable } from "@/components/finance/EnhancedInvoicesTable";
import { invoices } from "@/data/financeData";
import { Plus, Search, Download, Filter, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Invoicing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");

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

  // Calculate stats
  const totalInvoices = invoices.length;
  const draftCount = invoices.filter((i) => i.status === "draft").length;
  const sentCount = invoices.filter((i) => i.status === "sent").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const totalValue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invoicing Portal</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Create and manage proforma, commercial invoices, and credit/debit notes
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sent</p>
            <p className="text-2xl font-bold text-blue-600">{sentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              GHS {totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage all invoice types and statuses
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice, customer, or job reference..."
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
    </div>
  );
};

export default Invoicing;
