import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ClientProfile {
  id: string;
  user_id: string;
  customer_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface ClientAuthContextType {
  session: Session | null;
  user: User | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes for clients

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (session) {
      inactivityTimer.current = setTimeout(() => {
        supabase.auth.signOut();
      }, INACTIVITY_TIMEOUT);
    }
  }, [session]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  const fetchClientProfile = async (userId: string) => {
    const { data } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setClientProfile(data as ClientProfile | null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchClientProfile(session.user.id), 0);
      } else {
        setClientProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClientProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Verify this is actually a client user
    if (data.user) {
      const { data: cp } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      if (!cp) {
        await supabase.auth.signOut();
        return { error: "This account is not a client account. Please use the staff login." };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setClientProfile(null);
  };

  return (
    <ClientAuthContext.Provider value={{ session, user, clientProfile, loading, signIn, signOut }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error("useClientAuth must be used within ClientAuthProvider");
  return context;
}
