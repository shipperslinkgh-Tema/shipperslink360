import { useState, useEffect } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function ClientDocuments() {
  const { clientProfile } = useClientAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filtered = documents.filter(d =>
    d.document_name.toLowerCase().includes(search.toLowerCase()) ||
    d.document_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-success" /> Documents & SOPs</h1>
        <p className="text-muted-foreground text-sm">Access your shipping documents and standard operating procedures</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No documents found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.document_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{TYPE_LABELS[d.document_type] || d.document_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-0 ${d.status === "active" ? "bg-success/10 text-success" : d.status === "expired" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.file_size || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                    {d.file_url && (
                        <Button variant="ghost" size="sm" onClick={async () => {
                          const { data, error } = await supabase.storage
                            .from("client-documents")
                            .createSignedUrl(d.file_url, 60);
                          if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                          else toast.error("Failed to download");
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
