import { useState } from "react";
import { Plus, Search, Filter, Ship, Plane, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsolidationStats } from "@/components/consolidation/ConsolidationStats";
import { ConsolidationTable } from "@/components/consolidation/ConsolidationTable";
import { ConsolidationDetailPanel } from "@/components/consolidation/ConsolidationDetailPanel";
import { NewConsolidationForm } from "@/components/consolidation/NewConsolidationForm";
import { consolidations, shippers, demurrageRecords, operationalMetrics } from "@/data/consolidationData";
import { Consolidation } from "@/types/consolidation";

export default function ConsolidationPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedConsolidation, setSelectedConsolidation] = useState<Consolidation | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filteredConsolidations = consolidations.filter((c) => {
    const matchesSearch = c.consolidationRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.masterBLNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.masterAWBNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.carrier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedShippers = selectedConsolidation 
    ? shippers.filter(s => s.consolidationId === selectedConsolidation.id)
    : [];
  
  const selectedDemurrage = selectedConsolidation
    ? demurrageRecords.find(d => d.consolidationId === selectedConsolidation.id)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consolidation Portal</h1>
          <p className="text-muted-foreground">LCL & Air freight consolidation management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Consolidation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ConsolidationStats
        totalConsolidations={operationalMetrics.totalConsolidations}
        activeConsolidations={operationalMetrics.activeConsolidations}
        pendingCustoms={operationalMetrics.pendingCustomsClearance}
        totalRevenue={operationalMetrics.totalRevenue}
        avgTurnaround={operationalMetrics.averageTurnaroundDays}
        demurrageCharges={operationalMetrics.demurrageCharges}
        onTimeRate={operationalMetrics.onTimeDeliveryRate}
        totalCBM={operationalMetrics.totalCBMHandled}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search consolidations, BL/AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LCL">LCL Sea</SelectItem>
            <SelectItem value="AIR">Air Cargo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="receiving">Receiving</SelectItem>
            <SelectItem value="stuffing">Stuffing</SelectItem>
            <SelectItem value="customs">At Customs</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <ConsolidationTable 
        consolidations={filteredConsolidations} 
        onSelect={setSelectedConsolidation}
      />

      {/* Detail Panel */}
      {selectedConsolidation && (
        <ConsolidationDetailPanel
          consolidation={selectedConsolidation}
          shippers={selectedShippers}
          demurrage={selectedDemurrage}
          onClose={() => setSelectedConsolidation(null)}
        />
      )}

      {/* New Consolidation Form */}
      <NewConsolidationForm open={showNewForm} onOpenChange={setShowNewForm} />
    </div>
  );
}
