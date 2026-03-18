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
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerDetailsPanel } from "@/components/customers/CustomerDetailsPanel";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { useCustomers } from "@/hooks/useCustomers";
import { Customer } from "@/types/customer";
import { CSVImportDialog } from "@/components/shared/CSVImportDialog";
import { exportToCSV, type ExportColumn } from "@/lib/dataExport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Upload } from "lucide-react";

const CUSTOMER_EXPORT_COLUMNS: ExportColumn<Customer>[] = [
  { header: "Company Name", accessor: "companyName" },
  { header: "Trade Name", accessor: "tradeName" },
  { header: "Company Type", accessor: "companyType" },
  { header: "Email", accessor: "email" },
  { header: "Phone", accessor: "phone" },
  { header: "Registration No", accessor: "registrationNumber" },
  { header: "TIN", accessor: "tinNumber" },
  { header: "City", accessor: "city" },
  { header: "Country", accessor: "country" },
  { header: "Status", accessor: "status" },
  { header: "Industry", accessor: "industry" },
  { header: "Outstanding Balance", accessor: "outstandingBalance" },
  { header: "Credit Limit", accessor: "creditLimit" },
  { header: "Total Shipments", accessor: "totalShipments" },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useCustomers();

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
      const matchesType = typeFilter === "all" || customer.companyType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [customers, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    const pendingDocuments = customers.reduce(
      (acc, c) => acc + c.documents.filter((d) => d.status === "expired").length,
      0
    );
    const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
    return { totalCustomers, activeCustomers, pendingDocuments, totalOutstanding };
  }, [customers]);

  const handleExport = () => {
    exportToCSV(filteredCustomers, CUSTOMER_EXPORT_COLUMNS, "customers");
    toast({ title: "Export complete", description: `${filteredCustomers.length} customers exported to CSV` });
  };

  const handleImport = async (rows: Record<string, string>[]) => {
    const inserts = rows.map((r) => ({
      company_name: r["company_name"],
      email: r["email"],
      company_type: r["company_type"] || "importer",
      trade_name: r["trade_name"] || null,
      phone: r["phone"] || null,
      registration_number: r["registration_number"] || null,
      tin_number: r["tin_number"] || null,
      city: r["city"] || null,
      country: r["country"] || "Ghana",
      industry: r["industry"] || null,
      address: r["address"] || null,
    }));

    const { error } = await supabase.from("customers").insert(inserts);
    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Import complete", description: `${inserts.length} customers imported` });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer accounts, company details, and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <CustomerStats {...stats} />

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, email, or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="importer">Importer</SelectItem>
                  <SelectItem value="exporter">Exporter</SelectItem>
                  <SelectItem value="both">Importer/Exporter</SelectItem>
                  <SelectItem value="freight_forwarder">Freight Forwarder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CustomerTable
            customers={filteredCustomers}
            onViewCustomer={setSelectedCustomer}
          />

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <CustomerDetailsPanel
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      <CSVImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Customers"
        description="Upload a CSV with customer data. Required: company_name, email."
        requiredFields={["company_name", "email"]}
        optionalFields={["company_type", "trade_name", "phone", "registration_number", "tin_number", "city", "country", "industry", "address"]}
        onImport={handleImport}
      />
      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default Customers;
