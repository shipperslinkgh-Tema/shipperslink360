import { useState, useEffect, useMemo } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, FolderOpen, File, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/client/DocumentPreview";

// Only document types clients are allowed to view in the vault
const ALLOWED_TYPES = [
  "bill_of_lading",
  "invoice",
  "packing_list",
  "customs_declaration",
  "delivery_order",
  "receipt",
] as const;

const TYPE_LABELS: Record<string, string> = {
  bill_of_lading: "Bill of Lading",
  invoice: "Commercial Invoice",
  packing_list: "Packing List",
  customs_declaration: "Customs Entry (BOE)",
  delivery_order: "Delivery Order",
  receipt: "Receipt",
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "bill_of_lading", label: "BL" },
  { key: "invoice", label: "Invoice" },
  { key: "packing_list", label: "Packing List" },
  { key: "customs_declaration", label: "Customs Entry" },
  { key: "delivery_order", label: "Delivery Order" },
  { key: "receipt", label: "Receipts" },
];

export default function ClientDocuments() {
  const { clientProfile } = useClientAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [shipmentFilter, setShipmentFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  useEffect(() => {
    if (!clientProfile) return;
    (async () => {
      setLoading(true);
      const [docsRes, shipsRes] = await Promise.all([
        supabase
          .from("client_documents")
          .select("*")
          .eq("customer_id", clientProfile.customer_id)
          .in("document_type", ALLOWED_TYPES as unknown as string[])
          .order("created_at", { ascending: false }),
        supabase
          .from("client_shipments")
          .select("id, bl_number, consignment_id")
          .eq("customer_id", clientProfile.customer_id)
          .order("created_at", { ascending: false }),
      ]);
      setDocuments(docsRes.data || []);
      setShipments(shipsRes.data || []);
      setLoading(false);
    })();
  }, [clientProfile]);

  const shipmentLabel = (id?: string | null) => {
    if (!id) return null;
    const s = shipments.find(x => x.id === id);
    return s?.bl_number || s?.consignment_id || null;
  };

  const filtered = useMemo(() => documents.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      d.document_name?.toLowerCase().includes(q) ||
      (TYPE_LABELS[d.document_type] || "").toLowerCase().includes(q);
    const matchesCategory = activeCategory === "all" || d.document_type === activeCategory;
    const matchesShipment = shipmentFilter === "all" || d.shipment_id === shipmentFilter;
    const created = new Date(d.created_at);
    const matchesFrom = !fromDate || created >= new Date(fromDate);
    const matchesTo = !toDate || created <= new Date(`${toDate}T23:59:59`);
    return matchesSearch && matchesCategory && matchesShipment && matchesFrom && matchesTo;
  }), [documents, search, activeCategory, shipmentFilter, fromDate, toDate]);

  const handleDownload = async (doc: any) => {
    if (!doc.file_url) return;
    const { data } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_url, 60, { download: doc.document_name || true });
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Failed to download document");
  };

  const clearFilters = () => {
    setSearch(""); setShipmentFilter("all"); setFromDate(""); setToDate(""); setActiveCategory("all");
  };

  const hasActiveFilters = search || shipmentFilter !== "all" || fromDate || toDate || activeCategory !== "all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Document Vault
        </h1>
        <p className="text-muted-foreground text-sm">
          Securely view and download your shipment documents — Bill of Lading, Invoice, Packing List, Customs Entry, Delivery Orders & Receipts.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Document name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Consignment / Shipment</Label>
              <Select value={shipmentFilter} onValueChange={setShipmentFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All consignments</SelectItem>
                  {shipments.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.bl_number || s.consignment_id || s.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From date</Label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To date</Label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(cat => {
            const count = cat.key === "all"
              ? documents.length
              : documents.filter(d => d.document_type === cat.key).length;
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                {cat.label}
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents found.</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(d => {
            const shipLabel = shipmentLabel(d.shipment_id);
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                        <File className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.document_name}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {TYPE_LABELS[d.document_type] || d.document_type}
                        </Badge>
                      </div>
                    </div>
                    {d.file_url && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(d)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(d)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {shipLabel && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      Consignment: <span className="font-mono">{shipLabel}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                    {d.file_size && <span>{d.file_size}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DocumentPreview open={!!previewDoc} onClose={() => setPreviewDoc(null)} doc={previewDoc} />
    </div>
  );
}
