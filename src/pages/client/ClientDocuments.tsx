import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, FolderOpen, File, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  sop: "SOP",
  bill_of_lading: "Bill of Lading",
  customs_declaration: "Customs Declaration",
  invoice: "Invoice",
  packing_list: "Packing List",
  certificate_of_origin: "Certificate of Origin",
  delivery_order: "Delivery Order",
  other: "Other",
};

const CATEGORIES = [
  { key: "all", label: "All Documents" },
  { key: "shipping", label: "Shipping", types: ["bill_of_lading", "packing_list", "delivery_order"] },
  { key: "customs", label: "Customs", types: ["customs_declaration", "certificate_of_origin"] },
  { key: "financial", label: "Financial", types: ["invoice"] },
  { key: "sop", label: "SOPs", types: ["sop"] },
  { key: "other", label: "Other", types: ["other"] },
];

export default function ClientDocuments() {
  const { clientProfile } = useClientAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!clientProfile) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("client_documents")
        .select("*")
        .eq("customer_id", clientProfile.customer_id)
        .order("created_at", { ascending: false });
      setDocuments(data || []);
      setLoading(false);
    };
    fetch();
  }, [clientProfile]);

  const filtered = documents.filter(d => {
    const matchesSearch = d.document_name.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase());
    const category = CATEGORIES.find(c => c.key === activeCategory);
    const matchesCategory = activeCategory === "all" || (category?.types?.includes(d.document_type));
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (doc: any) => {
    if (!doc.file_url) return;
    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(doc.file_url, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Failed to download document");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Documents & SOPs
        </h1>
        <p className="text-muted-foreground text-sm">
          Access your shipping documents and standard operating procedures
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
              {cat.label}
              {cat.key !== "all" && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                  {documents.filter(d => cat.types?.includes(d.document_type)).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      d.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {d.document_type === "sop" ? <FileCheck className="h-5 w-5" /> : <File className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.document_name}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {TYPE_LABELS[d.document_type] || d.document_type}
                      </Badge>
                    </div>
                  </div>
                  {d.file_url && (
                    <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => handleDownload(d)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    {d.file_size && <span>{d.file_size}</span>}
                    <Badge className={cn("border-0 text-[10px]",
                      d.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      d.status === "expired" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {d.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
