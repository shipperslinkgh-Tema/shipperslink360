import { useState } from "react";
import { Search, Plus, FileArchive, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompletedConsignments } from "@/hooks/useCompletedConsignments";
import { useAuth } from "@/contexts/AuthContext";
import { ConsignmentList } from "@/components/office-files/ConsignmentList";
import { ConsignmentDetail } from "@/components/office-files/ConsignmentDetail";
import { NewConsignmentForm } from "@/components/office-files/NewConsignmentForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OfficeFilesPortal = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { isAdmin } = useAuth();
  const { data: consignments = [], isLoading } = useCompletedConsignments(search || undefined);

  const filtered = typeFilter === "all" ? consignments : consignments.filter(c => c.shipment_type === typeFilter);

  if (selectedId) {
    return (
      <ConsignmentDetail
        consignmentId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileArchive className="h-7 w-7 text-primary" />
            Office Files Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Permanent digital archive of completed consignment documents
          </p>
        </div>
        {isAdmin && (
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Consignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Archive New Consignment</DialogTitle>
              </DialogHeader>
              <NewConsignmentForm onSuccess={() => setShowNew(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by BL, AWB, Container, Client, Reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sea">Sea Freight</SelectItem>
            <SelectItem value="air">Air Freight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Total Archived</p>
          <p className="text-2xl font-bold text-foreground">{consignments.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Sea Freight</p>
          <p className="text-2xl font-bold text-primary">{consignments.filter(c => c.shipment_type === "sea").length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Air Freight</p>
          <p className="text-2xl font-bold text-primary">{consignments.filter(c => c.shipment_type === "air").length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-success">
            GHS {consignments.reduce((s, c) => s + (c.total_revenue || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* List */}
      <ConsignmentList
        consignments={filtered}
        isLoading={isLoading}
        onSelect={setSelectedId}
      />
    </div>
  );
};

export default OfficeFilesPortal;
