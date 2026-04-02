import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Department = "operations" | "documentation" | "accounts" | "marketing" | "customer_service" | "warehouse" | "management" | "super_admin";
type AppRole = "super_admin" | "admin" | "manager" | "staff";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  staff_id: string;
  department: Department;
  email: string;
  phone: string | null;
  username: string;
  avatar_url: string | null;
  must_change_password: boolean;
  is_active: boolean;
  is_locked: boolean;
  failed_login_attempts: number;
  last_login_at: string | null;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: (scope?: "local" | "global") => Promise<void>;
  isAdmin: boolean;
  department: Department | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 60 * 1000; // 1 minute
const WARNING_BEFORE = 10 * 1000; // warn 10 seconds before logout

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowWarning(false);
    warningShownRef.current = false;

    if (session) {
      // Warning timer
      warningTimer.current = setTimeout(() => {
        setShowWarning(true);
        warningShownRef.current = true;
        toast.warning("You will be logged out soon due to inactivity", { duration: 4500 });
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

      // Logout timer
      inactivityTimer.current = setTimeout(async () => {
        setShowWarning(false);
        await supabase.auth.signOut();
        toast.error("Session expired due to inactivity");
        window.location.href = "/login";
      }, INACTIVITY_TIMEOUT);
    }
  }, [session]);

  // Inactivity tracker
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, true));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer, true));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [resetInactivityTimer]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles((data || []).map((r: any) => r.role as AppRole));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Defer profile fetch to avoid deadlock
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchRoles(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Try to increment failed login attempts via edge function
      try {
        await supabase.functions.invoke("track-failed-login", {
          body: { email },
        });
      } catch (_) {
        // Silently fail - don't reveal user existence
      }
      return { error: "Invalid email or password." };
    }

    if (data.user) {
      // Check if account is locked
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_locked, is_active")
        .eq("user_id", data.user.id)
        .single();

      if (profileData?.is_locked) {
        await supabase.auth.signOut();
        return { error: "Your account has been locked due to too many failed login attempts. Contact an administrator." };
      }

      if (profileData && !profileData.is_active) {
        await supabase.auth.signOut();
        return { error: "Your account has been deactivated. Contact an administrator." };
      }

      // Reset failed attempts and update last login
      await supabase.rpc("reset_failed_login", { _user_id: data.user.id });

      // Log login history
      await supabase.from("login_history").insert({
        user_id: data.user.id,
        ip_address: "browser",
        user_agent: navigator.userAgent,
        success: true,
      });

      // Log audit trail
      await supabase.from("audit_logs").insert({
        user_id: data.user.id,
        action: "login",
        resource_type: "auth",
        resource_id: data.user.id,
        details: { user_agent: navigator.userAgent },
      });
    }

    return { error: null };
  };

  const signOut = async (scope: "local" | "global" = "local") => {
    // Log the sign-out action
    if (user) {
      try {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "logout",
          resource_type: "auth",
          resource_id: user.id,
          details: { scope } as any,
        });
      } catch (_) {}
    }
    await supabase.auth.signOut({ scope });
    setProfile(null);
    setRoles([]);
  };

  const isAdmin = roles.includes("super_admin") || roles.includes("admin");

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      roles,
      loading,
      signIn,
      signOut,
      isAdmin,
      department: profile?.department ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
