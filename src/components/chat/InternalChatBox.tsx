import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Users,
  Hash,
  Package,
  ChevronDown,
  Circle,
  Pencil,
  Trash2,
  Check,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useInternalChat, ChatChannelInfo } from "@/hooks/useInternalChat";

interface InternalChatBoxProps {
  isOpen: boolean;
  onToggle: () => void;
}

const departmentColors: Record<string, string> = {
  operations: "bg-accent",
  documentation: "bg-info",
  finance: "bg-success",
  trucking: "bg-warning",
  management: "bg-primary",
  customs: "bg-destructive",
  warehouse: "bg-secondary",
};

const departmentLabels: Record<string, string> = {
  operations: "OPS",
  documentation: "DOC",
  finance: "FIN",
  trucking: "TRK",
  management: "MGT",
  customs: "CUS",
  warehouse: "WHS",
};

export function InternalChatBox({ isOpen, onToggle }: InternalChatBoxProps) {
  const [activeChannel, setActiveChannel] = useState("general");
  const {
    messages,
    loading,
    channels,
    sendMessage,
    editMessage,
    deleteMessage,
    currentUserId,
  } = useInternalChat(activeChannel);

  const [messageText, setMessageText] = useState("");
  const [showChannels, setShowChannels] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChannel = channels.find((c) => c.id === activeChannel) || channels[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    const text = messageText;
    setMessageText("");
    await sendMessage(text);
  };

  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;
    await editMessage(id, editText);
    setEditingId(null);
    setEditText("");
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getChannelIcon = (type: ChatChannelInfo["type"]) => {
    switch (type) {
      case "department": return <Users className="h-4 w-4" />;
      case "consolidation": return <Package className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
            <Circle className="absolute -top-0.5 -right-0.5 h-2 w-2 fill-success text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-primary-foreground">SLAC Messenger</h3>
            <p className="text-xs text-primary-foreground/70">#{selectedChannel.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Channel Selector */}
      <div className="border-b border-border">
        <button
          onClick={() => setShowChannels(!showChannels)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {getChannelIcon(selectedChannel.type)}
            <span className="font-medium text-sm">{selectedChannel.name}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showChannels && "rotate-180")} />
        </button>

        {showChannels && (
          <div className="border-t border-border bg-muted/20">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  setActiveChannel(channel.id);
                  setShowChannels(false);
                }}
                className={cn(
                  "w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors text-left",
                  activeChannel === channel.id && "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  {getChannelIcon(channel.type)}
                  <span className="text-sm">{channel.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] text-white font-semibold",
                      departmentColors[msg.sender_department || ""] || "bg-muted"
                    )}
                  >
                    {msg.sender_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{msg.sender_name}</span>
                    {msg.sender_department && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 border-0 text-white",
                          departmentColors[msg.sender_department] || "bg-muted"
                        )}
                      >
                        {departmentLabels[msg.sender_department] || msg.sender_department}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                    {msg.is_edited && <span className="text-[9px] text-muted-foreground italic">(edited)</span>}
                  </div>

                  {editingId === msg.id ? (
                    <div className="flex gap-1 items-center">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(msg.id)}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(msg.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 break-words">{msg.message}</p>
                  )}

                  {msg.consolidation_ref && (
                    <Badge variant="outline" className="mt-1 text-[10px] bg-muted/50">
                      <Package className="h-3 w-3 mr-1" />
                      {msg.consolidation_ref}
                    </Badge>
                  )}
                </div>

                {/* Actions for own messages */}
                {isOwn && editingId !== msg.id && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditText(msg.message);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Message #${selectedChannel.name}...`}
            className="flex-1 h-9 bg-background"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90"
            disabled={!messageText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
