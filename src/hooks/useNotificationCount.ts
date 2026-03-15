import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useNotificationCount() {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const { count: c, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (!error && c !== null) setCount(c);
  };

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        fetchCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.user_id]);

  return count;
}
