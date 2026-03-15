import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, Building2, Shield, Calendar, Camera,
  Activity, Clock, FileText, CheckCircle, AlertTriangle, Loader2,
  Key, Lock, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DEPT_LABELS: Record<string, string> = {
  operations: "Operations",
  documentation: "Documentation",
  accounts: "Accounts & Finance",
  marketing: "Marketing",
  customer_service: "Customer Service",
  warehouse: "Warehousing",
  management: "Management / Admin",
  super_admin: "IT / System Administration",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

const PERMISSION_MAP: Record<string, string[]> = {
  super_admin: ["Full System Access", "User Management", "Settings", "All Modules", "Audit Logs", "Role Assignment"],
  management: ["All Modules", "Reports & Analytics", "Staff Overview", "Revenue Reports", "Operational Performance"],
  operations: ["Shipments", "Consignments", "Consolidation", "Customs", "Port Status", "Trucking", "Warehouse", "Customers"],
  documentation: ["Shipments", "Consignments", "Customs Declarations", "Shipping Lines", "GPHA Port Status"],
  accounts: ["Finance", "Invoices", "Payments", "Banking", "Customers", "Reports"],
  marketing: ["Customers", "Reports"],
  customer_service: ["Consignments", "Shipments", "Customers", "ICUMS Declarations"],
  warehouse: ["Warehouse", "Consignments", "Trucking", "Live Tracking", "Consolidation"],
};

export default function StaffProfile() {
  const { profile, roles, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [editPhone, setEditPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(profile?.phone || "");

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (profile?.avatar_url) {
      // Get signed URL for avatar
      supabase.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) setAvatarUrl(data.signedUrl);
        });
    }
  }, [profile?.avatar_url]);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      setLoadingLogs(true);
      const [auditRes, loginRes] = await Promise.all([
        supabase
          .from("audit_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("login_history")
          .select("*")
          .eq("user_id", user.id)
          .order("login_at", { ascending: false })
          .limit(10),
      ]);
      setActivityLogs(auditRes.data || []);
      setLoginHistory(loginRes.data || []);
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath } as any)
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Update failed", description: updateError.message, variant: "destructive" });
    } else {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(filePath, 3600);
      if (data?.signedUrl) setAvatarUrl(data.signedUrl);
      toast({ title: "Photo updated", description: "Your profile photo has been updated" });
    }
    setUploading(false);
  };

  const handlePhoneSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phoneValue } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Phone updated" });
      setEditPhone(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPw !== confirmPw) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPw.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      toast({ title: "Password change failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setShowPasswordSection(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
    setPwLoading(false);
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const permissions = PERMISSION_MAP[profile?.department || ""] || [];
  const roleLabel = roles.map((r) => ROLE_LABELS[r] || r).join(", ") || "Staff";

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <h2 className="text-lg font-bold mt-4 text-foreground">{profile?.full_name}</h2>
            <Badge className="mt-1 capitalize">{DEPT_LABELS[profile?.department || ""]}</Badge>
            <Badge variant="outline" className="mt-1 capitalize">{roleLabel}</Badge>

            <Separator className="my-4 w-full" />

            <div className="space-y-3 w-full text-left text-sm">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Staff ID</p>
                  <p className="font-mono font-medium">{profile?.staff_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {editPhone ? (
                    <div className="flex gap-1 mt-1">
                      <Input
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        className="h-7 text-sm"
                      />
                      <Button size="sm" className="h-7 text-xs" onClick={handlePhoneSave}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <p
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => {
                        setPhoneValue(profile?.phone || "");
                        setEditPhone(true);
                      }}
                    >
                      {profile?.phone || "Not set — click to add"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{DEPT_LABELS[profile?.department || ""]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date Joined</p>
                  <p className="font-medium">
                    {profile?.created_at ? format(new Date(profile.created_at), "MMMM d, yyyy") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {profile?.last_login_at
                      ? format(new Date(profile.last_login_at), "MMM d, yyyy h:mm a")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4 w-full" />

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Key className="h-4 w-4" /> Change Password
            </Button>

            {showPasswordSection && (
              <div className="w-full mt-4 space-y-3 text-left">
                <div className="space-y-1">
                  <Label className="text-xs">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handlePasswordChange}
                  disabled={pwLoading || !newPw || newPw !== confirmPw}
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity" className="gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Activity Log
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="logins" className="gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Login History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {activityLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="rounded-full p-1.5 bg-primary/10">
                              <Activity className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{log.action}</p>
                              {log.resource_type && (
                                <p className="text-xs text-muted-foreground">
                                  {log.resource_type}
                                  {log.resource_id && ` — ${log.resource_id}`}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">System Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      Based on your role ({roleLabel}) and department ({DEPT_LABELS[profile?.department || ""]}),
                      you have access to the following modules:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {permissions.map((perm) => (
                        <div
                          key={perm}
                          className="flex items-center gap-2 p-2.5 rounded-lg border bg-success/5 border-success/20"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                          <span className="text-xs font-medium">{perm}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <p className="text-xs text-muted-foreground">
                      Restricted areas are hidden from your navigation. Contact your Super Admin to request additional access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logins">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Login History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : loginHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No login history.</p>
                  ) : (
                    <div className="space-y-2">
                      {loginHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {entry.success ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {entry.success ? "Successful login" : "Failed attempt"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {format(new Date(entry.login_at), "MMM d, yyyy h:mm:ss a")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {entry.ip_address || "—"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
