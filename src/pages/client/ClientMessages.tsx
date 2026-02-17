import { useState, useEffect, useRef } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientMessages() {
  const { clientProfile, user } = useClientAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientProfile) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("client_messages")
        .select("*")
        .eq("customer_id", clientProfile.customer_id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("client-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "client_messages",
        filter: `customer_id=eq.${clientProfile.customer_id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientProfile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !clientProfile || !user) return;
    setSending(true);
    await supabase.from("client_messages").insert({
      customer_id: clientProfile.customer_id,
      sender_id: user.id,
      sender_type: "client",
      message: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-info" /> Messages</h1>
        <p className="text-muted-foreground text-sm">Communicate with the SLAC team</p>
      </div>

      <Card className="flex flex-col" style={{ height: "calc(100vh - 250px)" }}>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No messages yet. Send a message to get started.
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={cn("flex", m.sender_type === "client" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2.5 text-sm",
                  m.sender_type === "client"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}>
                  {m.subject && <p className="font-semibold text-xs mb-1">{m.subject}</p>}
                  <p>{m.message}</p>
                  <p className={cn("text-[10px] mt-1", m.sender_type === "client" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </CardContent>

        <div className="border-t border-border p-4 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
