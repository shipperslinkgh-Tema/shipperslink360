import { useState } from "react";
import { 
  Ship, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  Calendar,
  Container,
  FileText,
  RefreshCw,
  Search,
  Filter
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
import { cn } from "@/lib/utils";
import { ShippingLineCard } from "@/components/shipping-line/ShippingLineCard";
import { DOStatusTable } from "@/components/shipping-line/DOStatusTable";
import { DemurrageTracker } from "@/components/shipping-line/DemurrageTracker";

const metrics = [
  { label: "Active DOs", value: 34, icon: FileText, color: "text-accent" },
  { label: "Pending Release", value: 12, icon: Clock, color: "text-warning" },
  { label: "Free Days Expiring", value: 5, icon: AlertTriangle, color: "text-destructive" },
  { label: "Containers to Return", value: 8, icon: Container, color: "text-info" },
];

export default function ShippingLineStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Shipping Line Status</h1>
            <p className="text-muted-foreground">
              Track Delivery Orders, demurrage, and container status across all shipping lines
            </p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync All Lines
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className={cn("rounded-lg p-2.5", `bg-${metric.color.replace('text-', '')}/10`)}>
              <metric.icon className={cn("h-5 w-5", metric.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Line Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ShippingLineCard
          name="Maersk Line"
          logo="🚢"
          status="connected"
          activeDOs={12}
          pendingPayment={3}
          lastSync="2 min ago"
        />
        <ShippingLineCard
          name="MSC"
          logo="⚓"
          status="connected"
          activeDOs={8}
          pendingPayment={1}
          lastSync="5 min ago"
        />
        <ShippingLineCard
          name="CMA CGM"
          logo="🛳️"
          status="syncing"
          activeDOs={6}
          pendingPayment={2}
          lastSync="Syncing..."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by BL number, container, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={lineFilter} onValueChange={setLineFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Shipping Line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lines</SelectItem>
            <SelectItem value="maersk">Maersk</SelectItem>
            <SelectItem value="msc">MSC</SelectItem>
            <SelectItem value="cma">CMA CGM</SelectItem>
            <SelectItem value="hapag">Hapag-Lloyd</SelectItem>
            <SelectItem value="cosco">COSCO</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DOStatusTable searchQuery={searchQuery} lineFilter={lineFilter} />
        </div>
        <div>
          <DemurrageTracker />
        </div>
      </div>
    </div>
  );
}
