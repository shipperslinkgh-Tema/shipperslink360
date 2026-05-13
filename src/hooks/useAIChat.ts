import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type AIMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;
export type AIMessage = { role: "user" | "assistant"; content: AIMessageContent };

export type AIConversation = {
  id: string;
  module: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function deriveTitle(content: AIMessageContent): string {
  const text =
    typeof content === "string"
      ? content
      : content.filter(p => p.type === "text").map(p => (p as any).text).join(" ");
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New conversation";
  return trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed;
}

export function useAIChat(module: string = "chat") {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load conversation list for current user/module
  const refreshConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, module, title, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("module", module)
      .order("updated_at", { ascending: false });
    if (!error && data) setConversations(data as AIConversation[]);
  }, [module]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load messages when switching conversation
  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMessages(
        data.map((r: any) => ({ role: r.role, content: r.content as AIMessageContent }))
      );
    }
  }, []);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await supabase.from("ai_conversations").delete().eq("id", id);
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
      refreshConversations();
    },
    [conversationId, refreshConversations]
  );

  const sendMessage = useCallback(async (userInput: AIMessageContent) => {
    const isEmpty = typeof userInput === "string" ? !userInput.trim() : userInput.length === 0;
    if (isEmpty || isLoading) return;

    const userMsg: AIMessage = { role: "user", content: userInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantContent = "";
    let activeConvId = conversationId;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const userId = session?.user?.id;

      // Create conversation on first message
      if (!activeConvId && userId) {
        const { data: conv } = await supabase
          .from("ai_conversations")
          .insert({ user_id: userId, module, title: deriveTitle(userInput) })
          .select("id")
          .single();
        if (conv) {
          activeConvId = conv.id;
          setConversationId(conv.id);
        }
      }

      // Persist user message
      if (activeConvId && userId) {
        await supabase.from("ai_chat_messages").insert({
          conversation_id: activeConvId,
          user_id: userId,
          role: "user",
          content: userInput as any,
        });
      }

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: updatedMessages, module }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        if (resp.status === 429) {
          toast({ title: "Rate limit reached", description: err.error, variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI limit reached", description: err.error, variant: "destructive" });
        } else {
          toast({ title: "AI Error", description: err.error || "Failed to get response", variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              assistantContent += chunk;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              assistantContent += chunk;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Persist assistant message + bump conversation
      if (activeConvId && userId && assistantContent) {
        await supabase.from("ai_chat_messages").insert({
          conversation_id: activeConvId,
          user_id: userId,
          role: "assistant",
          content: assistantContent as any,
        });
        await supabase
          .from("ai_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeConvId);
        refreshConversations();
      }
    } catch (e) {
      console.error("AI chat error:", e);
      toast({ title: "Error", description: "Failed to connect to AI assistant", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, module, conversationId, refreshConversations]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversations,
    conversationId,
    loadConversation,
    newConversation,
    deleteConversation,
    refreshConversations,
  };
}
