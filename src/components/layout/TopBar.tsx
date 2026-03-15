import { useNavigate } from "react-router-dom";
import { Bell, Search, HelpCircle, RefreshCw, User, Settings, LogOut, CheckCircle2, Clock, AlertCircle, AlertTriangle, Key, Menu, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const integrationDetails = [
  {
    name: "ICUMS",
    fullName: "Ghana Customs (ICUMS)",
    status: "connected" as const,
    lastSync: "2 min ago",
    uptime: "99.8%",
    details: "Real-time declaration sync active. Processing 12 declarations today.",
  },
  {
    name: "GPHA",
    fullName: "Ghana Ports & Harbours Authority",
    status: "connected" as const,
    lastSync: "5 min ago",
    uptime: "99.5%",
    details: "Tema & Takoradi port systems connected. 46 containers tracked.",
  },
  {
    name: "ODeX",
    fullName: "ODeX Shipping Portal",
    status: "connected" as const,
    lastSync: "1 min ago",
    uptime: "98.9%",
    details: "DO processing active. 3 pending delivery orders.",
  },
];

const DEPT_LABELS: Record<string, string> = {
  operations: "Operations",
  documentation: "Documentation",
  accounts: "Accounts",
  marketing: "Marketing",
  customer_service: "Customer Service",
  warehouse: "Warehouse",
  management: "Management",
  super_admin: "Super Admin",
};
const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors: Record<string, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationBell() {
  const count = useNotificationCount();
  const navigate = useNavigate();

  const { data: recentNotifs = [] } = useQuery({
    queryKey: ["recent-notifications-bell"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, type, priority, created_at, is_read")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    refetchInterval: 30000,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-card">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs">{count} unread</Badge>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {recentNotifs.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No unread notifications
            </div>
          ) : (
            recentNotifs.map((n: any) => {
              const Icon = typeIcons[n.type] || Info;
              return (
                <div
                  key={n.id}
                  className="flex gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0"
                  onClick={() => navigate("/notifications")}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", typeColors[n.type])} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary"
            onClick={() => navigate("/notifications")}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const avatarSrc = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/authenticated/avatars/${profile.avatar_url}`
    : undefined;

  const openMobileMenu = () => {
    window.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-3 md:px-6 gap-2">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
        {isMobile && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={openMobileMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isMobile ? "Search..." : "Search shipments, BL numbers, customers..."}
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-accent text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Integration Status - hidden on mobile */}
        {!isMobile && (
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-muted/50 mr-2">
            {integrationDetails.map((integration) => (
              <Popover key={integration.name}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="integration-dot integration-connected" />
                    <span className="text-xs font-medium text-muted-foreground">{integration.name}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="center" sideOffset={8}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{integration.fullName}</h4>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground">{integration.details}</p>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Sync</p>
                        <p className="text-xs font-medium text-foreground">{integration.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                        <p className="text-xs font-medium text-foreground">{integration.uptime}</p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        )}

        {!isMobile && (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        <NotificationBell />

        {!isMobile && (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
          </Button>
        )}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarSrc} alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border border-border shadow-lg z-50" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                <Badge variant="secondary" className="text-[10px] capitalize w-fit mt-1">
                  {DEPT_LABELS[profile?.department || ""] || "Staff"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
              <Key className="mr-2 h-4 w-4" />
              <span>Update Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/notifications")}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notification Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
