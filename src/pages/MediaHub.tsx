import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Calendar,
  ArrowRight,
  BookOpen,
  Video,
  Download,
  Newspaper,
  Ship,
  TrendingUp,
  GraduationCap,
  Building2,
  Globe,
  Mail,
  Facebook,
  Linkedin,
  Twitter,
  MessageCircle,
  ChevronRight,
  Eye,
  Clock,
  FileText,
  Anchor,
  Package,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { id: "all", label: "All", icon: Globe },
  { id: "company_news", label: "Company News", icon: Building2 },
  { id: "port_customs", label: "Port & Customs", icon: Anchor },
  { id: "industry_news", label: "Industry News", icon: Newspaper },
  { id: "import_export_guides", label: "Import & Export Guides", icon: BookOpen },
  { id: "trade_insights", label: "Trade Insights", icon: TrendingUp },
  { id: "shipping_education", label: "Shipping Education", icon: GraduationCap },
];

const CONTENT_TYPES = [
  { id: "all", label: "All Types" },
  { id: "article", label: "Articles" },
  { id: "guide", label: "Guides" },
  { id: "video", label: "Videos" },
  { id: "publication", label: "Publications" },
];

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

const categoryColors: Record<string, string> = {
  company_news: "bg-primary/10 text-primary",
  port_customs: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  industry_news: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  import_export_guides: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  trade_insights: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  shipping_education: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const categoryLabels: Record<string, string> = {
  company_news: "Company News",
  port_customs: "Port & Customs",
  industry_news: "Industry News",
  import_export_guides: "Import & Export Guide",
  trade_insights: "Trade Insights",
  shipping_education: "Shipping Education",
};

const contentTypeIcons: Record<string, typeof BookOpen> = {
  article: FileText,
  guide: BookOpen,
  video: Video,
  publication: Download,
};

export default function MediaHub() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterCompany, setNewsletterCompany] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedType, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from("media_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory);
    }
    if (selectedType !== "all") {
      query = query.eq("content_type", selectedType);
    }
    if (searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error && data) setArticles(data);
    setLoading(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterName || !newsletterEmail) return;
    setSubscribing(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      name: newsletterName,
      email: newsletterEmail,
      company: newsletterCompany || null,
    });
    setSubscribing(false);
    if (error) {
      toast({ title: "Subscription failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscribed!", description: "You'll receive our latest logistics updates." });
      setNewsletterName("");
      setNewsletterEmail("");
      setNewsletterCompany("");
    }
  };

  const featuredArticles = articles.filter((a) => a.is_featured);
  const latestArticles = articles.filter((a) => !a.is_featured);

  const getPlaceholderImage = (category: string) => {
    const images: Record<string, string> = {
      company_news: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
      port_customs: "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800&h=400&fit=crop",
      industry_news: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=400&fit=crop",
      import_export_guides: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
      trade_insights: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      shipping_education: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop",
    };
    return images[category] || images.industry_news;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Ship className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground tracking-tight">Shippers Link</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/media-hub" className="text-primary font-semibold">Media Hub</Link>
            <Link to="/portal/login" className="hover:text-foreground transition-colors">Client Portal</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/95 via-primary to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs uppercase tracking-wider">
              Logistics Knowledge Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Logistics Media Hub
            </h1>
            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
              Your trusted source for freight forwarding news, customs updates, import guides, and trade insights across Ghana and West Africa.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles, guides, and publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-white text-foreground border-0 rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content Type Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">Type:</span>
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedType === type.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-80" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search or filters." : "Content is being prepared. Check back soon!"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredArticles.length > 0 && selectedCategory === "all" && !searchQuery && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Featured
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredArticles.slice(0, 2).map((article) => (
                    <FeaturedCard key={article.id} article={article} getPlaceholderImage={getPlaceholderImage} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                {selectedCategory === "all" ? "Latest Content" : categoryLabels[selectedCategory]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuredArticles.length > 0 && selectedCategory === "all" && !searchQuery
                  ? latestArticles
                  : articles
                ).map((article) => (
                  <ArticleCard key={article.id} article={article} getPlaceholderImage={getPlaceholderImage} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Newsletter */}
        <section className="mt-16 bg-gradient-to-br from-primary/5 via-primary/10 to-accent rounded-2xl p-8 md:p-12 border">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Stay Updated on Logistics
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive the latest port updates, customs news, and import guides from Shippers Link.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3 max-w-md mx-auto">
              <Input placeholder="Full name *" value={newsletterName} onChange={(e) => setNewsletterName(e.target.value)} required />
              <Input placeholder="Email address *" type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required />
              <Input placeholder="Company (optional)" value={newsletterCompany} onChange={(e) => setNewsletterCompany(e.target.value)} />
              <Button type="submit" className="w-full" disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe to Updates"}
              </Button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shippers Link Agencies Co., Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeaturedCard({ article, getPlaceholderImage }: { article: Article; getPlaceholderImage: (c: string) => string }) {
  const ContentIcon = contentTypeIcons[article.content_type] || FileText;
  return (
    <Link to={`/media-hub/${article.slug}`}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
        <div className="relative h-56 overflow-hidden">
          <img
            src={article.featured_image || getPlaceholderImage(article.category)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className={categoryColors[article.category] || "bg-muted text-foreground"}>
              {categoryLabels[article.category] || article.category}
            </Badge>
            <Badge variant="outline" className="bg-white/90 border-0 text-xs">
              <ContentIcon className="h-3 w-3 mr-1" />
              {article.content_type}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white leading-tight">{article.title}</h3>
          </div>
        </div>
        <CardContent className="p-5">
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{article.summary}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(article.published_at), "MMM d, yyyy")}
                </span>
              )}
              {article.views_count != null && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views_count}
                </span>
              )}
            </div>
            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArticleCard({ article, getPlaceholderImage }: { article: Article; getPlaceholderImage: (c: string) => string }) {
  const ContentIcon = contentTypeIcons[article.content_type] || FileText;
  return (
    <Link to={`/media-hub/${article.slug}`}>
      <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative h-44 overflow-hidden">
          <img
            src={article.featured_image || getPlaceholderImage(article.category)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge className={`text-[10px] ${categoryColors[article.category] || "bg-muted text-foreground"}`}>
              {categoryLabels[article.category] || article.category}
            </Badge>
          </div>
          {article.content_type !== "article" && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-white/90 border-0 text-[10px]">
                <ContentIcon className="h-3 w-3 mr-1" />
                {article.content_type}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 flex-1">{article.summary}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {article.published_at && (
              <span>{format(new Date(article.published_at), "MMM d, yyyy")}</span>
            )}
            <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
