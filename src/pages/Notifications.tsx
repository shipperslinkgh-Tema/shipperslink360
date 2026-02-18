import { useState, useEffect, useMemo } from "react";
import {
  Bell, BellOff, CheckCheck, Filter, Search, RefreshCw, Trash2, CheckCircle,
  AlertTriangle, AlertCircle, Info, Package, DollarSign, Warehouse, Settings,
  Clock, X, ChevronDown, Eye, Ship, FileText, Brain, Zap, MailCheck,
  SlidersHorizontal, Circle, TrendingDown, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "operations" | "finance" | "warehouse" | "management" | "system";
  priority: "low" | "medium" | "high" | "critical";
  is_read: boolean;
  is_resolved: boolean;
  read_at: string | null;
  resolved_at: string | null;
  recipient_id: string | null;
  recipient_department: string | null;
  reference_type: string | null;
  reference_id: string | null;
  action_url: string | null;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "text-destructive", dot: "bg-destructive" },
  high:     { label: "High",     color: "text-warning",     dot: "bg-warning" },
  medium:   { label: "Medium",   color: "text-info",        dot: "bg-info" },
  low:      { label: "Low",      color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
};

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  operations: { label: "Operations", icon: Package,    color: "text-info" },
  finance:    { label: "Finance",    icon: DollarSign, color: "text-success" },
  warehouse:  { label: "Warehouse",  icon: Warehouse,  color: "text-warning" },
  management: { label: "Management", icon: TrendingDown, color: "text-destructive" },
  system:     { label: "System",     icon: Settings,   color: "text-muted-foreground" },
};

const typeIcon: Record<string, React.ElementType> = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error:   AlertCircle,
};

const typeStyles: Record<string, string> = {
  info:    "border-l-info bg-info/5",
  success: "border-l-success bg-success/5",
  warning: "border-l-warning bg-warning/5",
  error:   "border-l-destructive bg-destructive/5",
};

const typeIconStyles: Record<string, string> = {
  info:    "text-info",
  success: "text-success",
  warning: "text-warning",
  error:   "text-destructive",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Smart Alert Row Component ─────────────────────────────────────────────────
function NotificationRow({
  n,
  onMarkRead,
  onResolve,
  onDelete,
  selected,
  onSelect,
}: {
  n: Notification;
  onMarkRead: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const TypeIcon = typeIcon[n.type] || Info;
  const CatConfig = categoryConfig[n.category];
  const CatIcon = CatConfig?.icon || Settings;
  const priConfig = priorityConfig[n.priority] || priorityConfig.medium;

  return (
    <div
      className={cn(
        "relative flex gap-3 rounded-lg border-l-4 p-4 transition-all cursor-pointer group",
        typeStyles[n.type],
        !n.is_read && "shadow-sm",
        n.is_resolved && "opacity-60",
        selected && "ring-2 ring-primary/30"
      )}
      onClick={() => !n.is_read && onMarkRead(n.id)}
    >
      {/* Unread dot */}
      {!n.is_read && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Checkbox */}
      <div className="flex-shrink-0 pt-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(n.id); }}
          className={cn(
            "h-4 w-4 rounded border-2 transition-colors flex items-center justify-center",
            selected ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {selected && <CheckCheck className="h-3 w-3 text-primary-foreground" />}
        </button>
      </div>

      {/* Icon */}
      <div className={cn("mt-0.5 flex-shrink-0", typeIconStyles[n.type])}>
        <TypeIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className={cn("text-sm font-semibold text-foreground leading-tight", n.is_read && "font-medium")}>
            {n.title}
          </p>
          {n.is_resolved && (
            <Badge variant="secondary" className="text-xs shrink-0">Resolved</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Category */}
          <span className={cn("flex items-center gap-1 text-xs", CatConfig?.color)}>
            <CatIcon className="h-3 w-3" />
            {CatConfig?.label || n.category}
          </span>
          {/* Priority */}
          <span className={cn("flex items-center gap-1 text-xs font-medium", priConfig.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", priConfig.dot)} />
            {priConfig.label}
          </span>
          {/* Time */}
          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(n.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.is_resolved && (
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
            title="Mark Resolved"
            onClick={(e) => { e.stopPropagation(); onResolve(n.id); }}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter(n => !n.is_read).length;
  const critical = notifications.filter(n => n.priority === "critical" && !n.is_resolved).length;
  const ops = notifications.filter(n => n.category === "operations").length;
  const fin = notifications.filter(n => n.category === "finance").length;
  const wh = notifications.filter(n => n.category === "warehouse").length;

  const stats = [
    { label: "Unread", value: unread, color: "text-primary", bg: "bg-primary/10" },
    { label: "Critical", value: critical, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Operations", value: ops, color: "text-info", bg: "bg-info/10" },
    { label: "Finance", value: fin, color: "text-success", bg: "bg-success/10" },
    { label: "Warehouse", value: wh, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
          <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    ops_shipment: true, ops_customs: true, ops_delayed: true, ops_missing_doc: true,
    fin_invoice: true, fin_payment: true, fin_overdue: true, fin_demurrage: true,
    wh_received: true, wh_aging: true, wh_capacity: true, wh_damage: true,
    mgmt_kpi: true, mgmt_risk: true, mgmt_bottleneck: false,
    email_enabled: false, sms_enabled: false, digest_daily: true, digest_weekly: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const Section = ({ title, icon: Icon, keys }: { title: string; icon: React.ElementType; keys: { key: keyof typeof prefs; label: string }[] }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {keys.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm font-normal">{label}</Label>
            <Switch checked={prefs[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Operations Alerts" icon={Package} keys={[
          { key: "ops_shipment", label: "Shipment status updates" },
          { key: "ops_customs", label: "Customs declaration changes" },
          { key: "ops_delayed", label: "Delayed shipment warnings" },
          { key: "ops_missing_doc", label: "Missing document alerts" },
        ]} />
        <Section title="Finance Alerts" icon={DollarSign} keys={[
          { key: "fin_invoice", label: "Invoice generated" },
          { key: "fin_payment", label: "Payment received" },
          { key: "fin_overdue", label: "Overdue invoice alerts" },
          { key: "fin_demurrage", label: "Demurrage risk alerts" },
        ]} />
        <Section title="Warehouse Alerts" icon={Warehouse} keys={[
          { key: "wh_received", label: "Cargo received confirmations" },
          { key: "wh_aging", label: "Cargo aging threshold alerts" },
          { key: "wh_capacity", label: "Capacity threshold warnings" },
          { key: "wh_damage", label: "Damage / loss incidents" },
        ]} />
        <Section title="Management Alerts" icon={Activity} keys={[
          { key: "mgmt_kpi", label: "KPI threshold drops" },
          { key: "mgmt_risk", label: "High-risk client exposure" },
          { key: "mgmt_bottleneck", label: "Operational bottleneck detection" },
        ]} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MailCheck className="h-4 w-4" /> Delivery Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Alerts</Label>
              <p className="text-xs text-muted-foreground">Send email for high/critical alerts</p>
            </div>
            <Switch checked={prefs.email_enabled} onCheckedChange={() => toggle("email_enabled")} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">Send SMS for critical alerts only</p>
            </div>
            <Switch checked={prefs.sms_enabled} onCheckedChange={() => toggle("sms_enabled")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Daily digest summary</Label>
            <Switch checked={prefs.digest_daily} onCheckedChange={() => toggle("digest_daily")} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Weekly digest summary</Label>
            <Switch checked={prefs.digest_weekly} onCheckedChange={() => toggle("digest_weekly")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Notification preferences saved")}>
          <CheckCheck className="mr-2 h-4 w-4" />Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { profile, department, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("unread");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("inbox");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications", department, isAdmin],
    queryFn: async () => {
      let q = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Notification[];
    },
  });

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.info("New notification received");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_resolved: true, is_read: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Marked as resolved");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const bulkResolveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_resolved: true, is_read: true, resolved_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSelectedIds([]);
      toast.success("Selected notifications resolved");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("notifications").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSelectedIds([]);
      toast.success("Selected notifications deleted");
    },
  });

  // ── Filter Logic ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (filterStatus === "unread" && n.is_read) return false;
      if (filterStatus === "read" && !n.is_read) return false;
      if (filterStatus === "resolved" && !n.is_resolved) return false;
      if (filterStatus === "unresolved" && n.is_resolved) return false;
      if (filterCategory !== "all" && n.category !== filterCategory) return false;
      if (filterPriority !== "all" && n.priority !== filterPriority) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, filterStatus, filterCategory, filterPriority, search]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectAll = () =>
    setSelectedIds(filtered.map(n => n.id));

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notification Center</h1>
              <p className="text-sm text-muted-foreground">Real-time alerts and system notifications</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsStrip notifications={notifications} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="inbox" className="gap-2">
            <Bell className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* ── INBOX ── */}
        <TabsContent value="inbox" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category filter */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36">
                    <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                {/* Priority filter */}
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-36">
                    <Zap className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm" className="text-success hover:text-success" onClick={() => bulkResolveMutation.mutate(selectedIds)}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Resolve All
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.length} notifications?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => bulkDeleteMutation.mutate(selectedIds)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear
              </Button>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-muted-foreground">
                  Select all {filtered.length}
                </Button>
              </div>
            </div>
          )}

          {/* Notification list */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Critical section */}
              {filtered.some(n => n.priority === "critical" && !n.is_resolved) && filterPriority === "all" && (
                <>
                  <div className="flex items-center gap-2 text-destructive text-xs font-semibold uppercase tracking-wider px-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Critical Alerts
                  </div>
                  {filtered.filter(n => n.priority === "critical" && !n.is_resolved).map(n => (
                    <NotificationRow
                      key={n.id} n={n}
                      onMarkRead={id => markReadMutation.mutate(id)}
                      onResolve={id => resolveMutation.mutate(id)}
                      onDelete={id => deleteMutation.mutate(id)}
                      selected={selectedIds.includes(n.id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1 pt-2">
                    <Circle className="h-3 w-3" />
                    Other Notifications
                  </div>
                </>
              )}

              {/* Regular / remaining */}
              {filtered
                .filter(n => !(filterPriority === "all" && n.priority === "critical" && !n.is_resolved))
                .map(n => (
                  <NotificationRow
                    key={n.id} n={n}
                    onMarkRead={id => markReadMutation.mutate(id)}
                    onResolve={id => resolveMutation.mutate(id)}
                    onDelete={id => deleteMutation.mutate(id)}
                    selected={selectedIds.includes(n.id)}
                    onSelect={toggleSelect}
                  />
                ))
              }
            </div>
          )}

          {/* Footer count */}
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Showing {filtered.length} of {notifications.length} notifications
            </p>
          )}
        </TabsContent>

        {/* ── SETTINGS ── */}
        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
