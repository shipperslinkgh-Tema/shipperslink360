import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HEARTBEAT_INTERVAL = 60_000; // 1 minute

/**
 * Tracks user presence by updating online_at in profiles table.
 * Call once at the app level.
 */
export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const heartbeat = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ online_at: new Date().toISOString() } as any)
      .eq("user_id", user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial heartbeat
    heartbeat();

    // Periodic heartbeat
    intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    // Cleanup on unmount / sign out
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, heartbeat]);
}

/**
 * Check if a user is online (heartbeat within last 2 minutes)
 */
export function isUserOnline(onlineAt: string | null): boolean {
  if (!onlineAt) return false;
  const diff = Date.now() - new Date(onlineAt).getTime();
  return diff < 2 * 60 * 1000;
}
