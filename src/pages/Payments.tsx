import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayablesTable } from "@/components/finance/PayablesTable";
import { ReceivablesTable } from "@/components/finance/ReceivablesTable";
import { ShippingLinePaymentVoucherForm } from "@/components/finance/ShippingLinePaymentVoucherForm";
import { payables, receivables, agingSummary } from "@/data/financeData";
import {
  Plus,
  Search,
  Download,
  Filter,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
} from "lucide-react";

const Payments = () => {
  const [activeTab, setActiveTab] = useState("receivables");
  const [searchTerm, setSearchTerm] = useState("");
  const [payableStatusFilter, setPayableStatusFilter] = useState<string>("all");

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

  // Calculate stats
  const totalReceivables = receivables.reduce((sum, r) => sum + r.outstandingAmount, 0);
  const totalPayables = payables.reduce((sum, p) => sum + p.amount, 0);
  const overdueReceivables = receivables.filter((r) => r.status === "overdue").length;
  const pendingPayables = payables.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Payments Portal</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Manage accounts receivable and payable
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ShippingLinePaymentVoucherForm />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Receivables</p>
              <p className="text-2xl font-bold">GHS {totalReceivables.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payables</p>
              <p className="text-2xl font-bold">GHS {totalPayables.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue Receivables</p>
              <p className="text-2xl font-bold">{overdueReceivables}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payables</p>
              <p className="text-2xl font-bold">{pendingPayables}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-bold text-green-600">
                GHS {agingSummary.current.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
              <p className="text-sm text-muted-foreground">1-30 Days</p>
              <p className="text-xl font-bold text-yellow-600">
                GHS {agingSummary.days1to30.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10">
              <p className="text-sm text-muted-foreground">31-60 Days</p>
              <p className="text-xl font-bold text-orange-600">
                GHS {agingSummary.days31to60.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
              <p className="text-sm text-muted-foreground">61-90 Days</p>
              <p className="text-xl font-bold text-red-600">
                GHS {agingSummary.days61to90.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/20">
              <p className="text-sm text-muted-foreground">90+ Days</p>
              <p className="text-xl font-bold text-red-700">
                GHS {agingSummary.days90plus.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="receivables" className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Accounts Receivable
          </TabsTrigger>
          <TabsTrigger value="payables" className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Accounts Payable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track outstanding invoices and customer payments
              </p>
            </CardHeader>
            <CardContent>
              <ReceivablesTable receivables={receivables} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Accounts Payable</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage vendor payments for shipping lines, customs, GPHA, and transport
                  </p>
                </div>
              </div>
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
      </Tabs>
    </div>
  );
};

export default Payments;
