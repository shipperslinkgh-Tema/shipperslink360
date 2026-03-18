import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Eye,
  User,
  Share2,
  Facebook,
  Linkedin,
  Twitter,
  MessageCircle,
  Download,
  Play,
  Ship,
  ChevronRight,
  BookOpen,
  FileText,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

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

const categoryLabels: Record<string, string> = {
  company_news: "Company News",
  port_customs: "Port & Customs",
  industry_news: "Industry News",
  import_export_guides: "Import & Export Guide",
  trade_insights: "Trade Insights",
  shipping_education: "Shipping Education",
};

const categoryColors: Record<string, string> = {
  company_news: "bg-primary/10 text-primary",
  port_customs: "bg-blue-100 text-blue-700",
  industry_news: "bg-emerald-100 text-emerald-700",
  import_export_guides: "bg-amber-100 text-amber-700",
  trade_insights: "bg-purple-100 text-purple-700",
  shipping_education: "bg-rose-100 text-rose-700",
};

export default function MediaArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchArticle(slug);
  }, [slug]);

  const fetchArticle = async (slug: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("media_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (data) {
      setArticle(data);
      // Increment views
      supabase
        .from("media_articles")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", data.id)
        .then();

      // Fetch related
      const { data: rel } = await supabase
        .from("media_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);
      if (rel) setRelated(rel);
    }
    setLoading(false);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title || "";

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Article not found</h2>
        <Link to="/media-hub">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Media Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Ship className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Shippers Link</span>
          </Link>
          <Link to="/media-hub" className="text-sm font-medium text-primary hover:underline">
            ← Back to Media Hub
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/media-hub" className="hover:text-foreground">Media Hub</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{categoryLabels[article.category] || article.category}</span>
        </nav>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge className={categoryColors[article.category]}>{categoryLabels[article.category]}</Badge>
          {article.content_type !== "article" && (
            <Badge variant="outline" className="capitalize">{article.content_type}</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {article.author && (
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{article.author}</span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(article.published_at), "MMMM d, yyyy")}
            </span>
          )}
          {article.views_count != null && (
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.views_count} views</span>
          )}
        </div>

        {/* Featured image */}
        {article.featured_image && (
          <div className="rounded-xl overflow-hidden mb-8">
            <img src={article.featured_image} alt={article.title} className="w-full h-auto max-h-[480px] object-cover" />
          </div>
        )}

        {/* Video embed */}
        {article.video_url && (
          <div className="mb-8 rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={article.video_url}
              className="w-full h-full"
              allowFullScreen
              title={article.title}
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert mb-10">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Download */}
        {article.download_url && (
          <div className="bg-muted rounded-xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Download Publication</p>
                <p className="text-sm text-muted-foreground">Available in PDF format</p>
              </div>
            </div>
            <a href={article.download_url} target="_blank" rel="noopener noreferrer">
              <Button>Download PDF</Button>
            </a>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <span className="text-sm text-muted-foreground">Tags:</span>
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="border-t pt-6 mb-12">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share this article
          </p>
          <div className="flex items-center gap-2">
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm"><Linkedin className="h-4 w-4 mr-1" /> LinkedIn</Button>
            </a>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm"><Facebook className="h-4 w-4 mr-1" /> Facebook</Button>
            </a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</Button>
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm"><Twitter className="h-4 w-4 mr-1" /> X</Button>
            </a>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} to={`/media-hub/${r.slug}`}>
                  <Card className="group hover:shadow-md transition-all h-full">
                    <CardContent className="p-4">
                      <Badge className={`text-[10px] mb-2 ${categoryColors[r.category]}`}>
                        {categoryLabels[r.category]}
                      </Badge>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      {r.published_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(r.published_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <footer className="border-t bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shippers Link Agencies Co., Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
