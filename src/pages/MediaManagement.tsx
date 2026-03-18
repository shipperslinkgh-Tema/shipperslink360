import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Globe, EyeOff, Star, FileText, Video, BookOpen, Download } from "lucide-react";
import { format } from "date-fns";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string | null;
  category: string;
  content_type: string;
  video_url: string | null;
  download_url: string | null;
  author: string | null;
  tags: string[] | null;
  views_count: number | null;
  published_at: string | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  created_at: string;
};

const CATEGORIES = [
  { value: "company_news", label: "Company News" },
  { value: "port_customs", label: "Port & Customs Updates" },
  { value: "industry_news", label: "Industry News" },
  { value: "import_export_guides", label: "Import & Export Guides" },
  { value: "trade_insights", label: "Trade Insights" },
  { value: "shipping_education", label: "Shipping Education" },
];

const CONTENT_TYPES = [
  { value: "article", label: "Article" },
  { value: "guide", label: "Guide" },
  { value: "video", label: "Video" },
  { value: "publication", label: "Publication" },
];

const emptyForm = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  featured_image: "",
  category: "company_news",
  content_type: "article",
  video_url: "",
  download_url: "",
  author: "Shippers Link Agencies",
  tags: "",
  is_featured: false,
  is_published: false,
};

export default function MediaManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("media_articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      content: a.content,
      featured_image: a.featured_image || "",
      category: a.category,
      content_type: a.content_type,
      video_url: a.video_url || "",
      download_url: a.download_url || "",
      author: a.author || "Shippers Link Agencies",
      tags: (a.tags || []).join(", "),
      is_featured: a.is_featured || false,
      is_published: a.is_published || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.summary || !form.content) {
      toast({ title: "Missing fields", description: "Title, summary and content are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      title: form.title,
      slug,
      summary: form.summary,
      content: form.content,
      featured_image: form.featured_image || null,
      category: form.category,
      content_type: form.content_type,
      video_url: form.video_url || null,
      download_url: form.download_url || null,
      author: form.author || null,
      tags,
      is_featured: form.is_featured,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("media_articles").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("media_articles").insert(payload));
    }
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Updated" : "Created", description: "Article saved successfully." });
      setDialogOpen(false);
      fetchArticles();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("media_articles").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted" });
      fetchArticles();
    }
  };

  const togglePublish = async (a: Article) => {
    const newPublished = !a.is_published;
    await supabase.from("media_articles").update({
      is_published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
    }).eq("id", a.id);
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Hub Management</h1>
          <p className="text-muted-foreground">Create and manage articles, guides, and publications</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Content</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Card key={a.id} className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{a.title}</h3>
                  {a.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">{a.category.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{a.content_type}</Badge>
                  {a.is_published ? (
                    <Badge className="bg-green-100 text-green-700 text-[10px]"><Globe className="h-3 w-3 mr-1" />Published</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>
                  )}
                  <span>{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                  {a.views_count != null && <span>{a.views_count} views</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm" onClick={() => togglePublish(a)}>
                  {a.is_published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No articles yet. Click "New Content" to get started.
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content Type</Label>
                <Select value={form.content_type} onValueChange={(v) => setForm({ ...form, content_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Summary *</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Content * (Markdown supported)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Featured Image URL</Label>
              <Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            {form.content_type === "video" && (
              <div>
                <Label>Video Embed URL</Label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/embed/..." />
              </div>
            )}
            {form.content_type === "publication" && (
              <div>
                <Label>Download URL (PDF)</Label>
                <Input value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })} placeholder="https://..." />
              </div>
            )}
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="customs, import, ghana" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : editing ? "Update" : "Create"} Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
