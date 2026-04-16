import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessageRow {
  id: string;
  channel: string;
  sender_id: string;
  sender_name: string;
  sender_department: string | null;
  message: string;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  consolidation_ref: string | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
}

export interface ChatChannelInfo {
  id: string;
  name: string;
  type: "department" | "consolidation" | "direct";
  unreadCount: number;
}

const CHANNELS: ChatChannelInfo[] = [
  { id: "general", name: "General", type: "department", unreadCount: 0 },
  { id: "operations", name: "Operations", type: "department", unreadCount: 0 },
  { id: "finance", name: "Finance", type: "department", unreadCount: 0 },
  { id: "documentation", name: "Documentation", type: "department", unreadCount: 0 },
  { id: "management", name: "Management", type: "department", unreadCount: 0 },
  { id: "warehouse", name: "Warehouse", type: "department", unreadCount: 0 },
];

export function useInternalChat(activeChannel: string) {
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, profile } = useAuth();
  const { toast } = useToast();

  // Fetch messages for channel
  const fetchMessages = useCallback(async () => {
    if (!activeChannel) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel", activeChannel)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Fetch chat error:", error);
    } else {
      setMessages((data as ChatMessageRow[]) || []);
    }
    setLoading(false);
  }, [activeChannel]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${activeChannel}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel=eq.${activeChannel}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `channel=eq.${activeChannel}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessageRow;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
          filter: `channel=eq.${activeChannel}`,
        },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  const sendMessage = useCallback(
    async (text: string, consolidationRef?: string) => {
      if (!session?.user || !profile) return;

      const { error } = await supabase.from("chat_messages").insert({
        channel: activeChannel,
        sender_id: session.user.id,
        sender_name: profile.full_name,
        sender_department: profile.department,
        message: text,
        message_type: "text",
        consolidation_ref: consolidationRef || null,
      } as any);

      if (error) {
        console.error("Send message error:", error);
        toast({
          title: "Failed to send",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [session, profile, activeChannel, toast]
  );

  const sendFileMessage = useCallback(
    async (fileName: string, fileUrl: string) => {
      if (!session?.user || !profile) return;

      const { error } = await supabase.from("chat_messages").insert({
        channel: activeChannel,
        sender_id: session.user.id,
        sender_name: profile.full_name,
        sender_department: profile.department,
        message: `📎 ${fileName}`,
        message_type: "file",
        file_name: fileName,
        file_url: fileUrl,
      } as any);

      if (error) {
        console.error("Send file message error:", error);
        toast({
          title: "Failed to send file",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [session, profile, activeChannel, toast]
  );

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({
          message: newText,
          is_edited: true,
          edited_at: new Date().toISOString(),
        } as any)
        .eq("id", messageId);

      if (error) {
        toast({ title: "Edit failed", description: error.message, variant: "destructive" });
      }
    },
    [toast]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", messageId);

      if (error) {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      }
    },
    [toast]
  );

  return {
    messages,
    loading,
    channels: CHANNELS,
    sendMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    currentUserId: session?.user?.id,
  };
}
