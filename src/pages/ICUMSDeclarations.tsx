import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Declaration {
  id: string;
  icumsRef: string;
  blNumber: string;
  customer: string;
  declarationType: "Import" | "Export" | "Transit";
  status: "draft" | "submitted" | "assessment" | "payment" | "examination" | "released";
  submissionDate: string;
  assessedValue?: string;
  dutyAmount?: string;
  port: string;
}

const declarations: Declaration[] = [
  {
    id: "DEC001",
    icumsRef: "C2026-00892",
    blNumber: "MSKU2345678",
    customer: "Gold Coast Trading Ltd",
    declarationType: "Import",
    status: "examination",
    submissionDate: "Jan 18, 2026",
    assessedValue: "GH₵ 485,200",
    dutyAmount: "GH₵ 72,780",
    port: "Tema",
  },
  {
    id: "DEC002",
    icumsRef: "C2026-00895",
    blNumber: "AWB-7890123",
    customer: "Accra Electronics",
    declarationType: "Import",
    status: "payment",
    submissionDate: "Jan 19, 2026",
    assessedValue: "GH₵ 156,800",
    dutyAmount: "GH₵ 23,520",
    port: "Kotoka Airport",
  },
  {
    id: "DEC003",
    icumsRef: "C2026-00901",
    blNumber: "AWB-1234567",
    customer: "Cape Coast Imports",
    declarationType: "Import",
    status: "assessment",
    submissionDate: "Jan 20, 2026",
    port: "Kotoka Airport",
  },
  {
    id: "DEC004",
    icumsRef: "C2026-00875",
    blNumber: "OOLU1234567",
    customer: "Takoradi Steel",
    declarationType: "Import",
    status: "released",
    submissionDate: "Jan 15, 2026",
    assessedValue: "GH₵ 1,250,000",
    dutyAmount: "GH₵ 187,500",
    port: "Takoradi",
  },
  {
    id: "DEC005",
    icumsRef: "C2026-00910",
    blNumber: "HLCU5678901",
    customer: "Ghana Pharma Ltd",
    declarationType: "Import",
    status: "submitted",
    submissionDate: "Jan 21, 2026",
    port: "Tema",
  },
  {
    id: "DEC006",
    icumsRef: "—",
    blNumber: "COSU8901234",
    customer: "West Africa Motors",
    declarationType: "Import",
    status: "draft",
    submissionDate: "—",
    port: "Tema",
  },
];

const getStatusProgress = (status: Declaration["status"]) => {
  const steps = ["draft", "submitted", "assessment", "payment", "examination", "released"];
  const index = steps.indexOf(status);
  return ((index + 1) / steps.length) * 100;
};

const getStatusBadge = (status: Declaration["status"]) => {
  const config = {
    draft: { label: "Draft", class: "status-pending" },
    submitted: { label: "Submitted", class: "status-info" },
    assessment: { label: "Under Assessment", class: "status-warning" },
    payment: { label: "Awaiting Payment", class: "status-warning" },
    examination: { label: "Examination", class: "status-info" },
    released: { label: "Released", class: "status-success" },
  };

  return <span className={cn("status-badge", config[status].class)}>{config[status].label}</span>;
};

export default function ICUMSDeclarations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDeclarations = declarations.filter((dec) => {
    const matchesSearch =
      dec.icumsRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dec.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dec.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ICUMS Declarations</h1>
          <p className="text-muted-foreground">
            Manage customs declarations and track clearance status
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync ICUMS
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" />
            New Declaration
          </Button>
        </div>
      </div>

      {/* Integration Status Banner */}
      <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-foreground">ICUMS Integration Active</p>
            <p className="text-sm text-muted-foreground">Last synced 2 minutes ago</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open ICUMS Portal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ICUMS ref, BL number, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="examination">Examination</SelectItem>
              <SelectItem value="released">Released</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Draft", count: 1, icon: FileCheck, color: "text-muted-foreground" },
          { label: "Submitted", count: 1, icon: Clock, color: "text-info" },
          { label: "Assessment", count: 1, icon: AlertCircle, color: "text-warning" },
          { label: "Payment", count: 1, icon: Clock, color: "text-warning" },
          { label: "Released", count: 1, icon: CheckCircle2, color: "text-success" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <stat.icon className={cn("h-5 w-5", stat.color)} />
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ICUMS Ref
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  BL/AWB
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Port
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Duty Amount
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDeclarations.map((dec) => (
                <tr key={dec.id} className="data-row">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-medium text-accent">{dec.icumsRef}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-foreground">{dec.blNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-sm font-medium text-foreground">{dec.customer}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{dec.declarationType}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">{dec.port}</span>
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(dec.status)}</td>
                  <td className="px-5 py-4">
                    <div className="w-32">
                      <Progress value={getStatusProgress(dec.status)} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Step {Math.ceil(getStatusProgress(dec.status) / 16.67)} of 6
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {dec.dutyAmount ? (
                      <span className="text-sm font-medium text-foreground">{dec.dutyAmount}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Status
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-accent">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in ICUMS
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
