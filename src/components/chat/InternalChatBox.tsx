import { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Search, 
  Users, 
  Hash, 
  Package,
  ChevronDown,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatChannel } from "@/types/consolidation";
import { chatMessages, chatChannels } from "@/data/consolidationData";

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
};

const departmentLabels: Record<string, string> = {
  operations: "OPS",
  documentation: "DOC",
  finance: "FIN",
  trucking: "TRK",
  management: "MGT",
  customs: "CUS",
};

export function InternalChatBox({ isOpen, onToggle }: InternalChatBoxProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(chatChannels[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [showChannels, setShowChannels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `MSG${Date.now()}`,
      senderId: "current-user",
      senderName: "Nana Akuoko Sarpong",
      senderDepartment: "management",
      content: message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const totalUnread = chatChannels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getChannelIcon = (type: ChatChannel["type"]) => {
    switch (type) {
      case "department":
        return <Users className="h-4 w-4" />;
      case "consolidation":
        return <Package className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
            {totalUnread}
          </Badge>
        )}
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
            <p className="text-xs text-primary-foreground/70">Operations Team</p>
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
            {selectedChannel && getChannelIcon(selectedChannel.type)}
            <span className="font-medium text-sm">{selectedChannel?.name || "Select Channel"}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            showChannels && "rotate-180"
          )} />
        </button>

        {showChannels && (
          <div className="border-t border-border bg-muted/20">
            {chatChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel);
                  setShowChannels(false);
                }}
                className={cn(
                  "w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors text-left",
                  selectedChannel?.id === channel.id && "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  {getChannelIcon(channel.type)}
                  <span className="text-sm">{channel.name}</span>
                </div>
                {channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    {channel.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={cn(
                  "text-[10px] text-white font-semibold",
                  departmentColors[msg.senderDepartment]
                )}>
                  {msg.senderName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {msg.senderName}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 border-0 text-white",
                      departmentColors[msg.senderDepartment]
                    )}
                  >
                    {departmentLabels[msg.senderDepartment]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                {msg.consolidationRef && (
                  <Badge variant="outline" className="mt-1 text-[10px] bg-muted/50">
                    <Package className="h-3 w-3 mr-1" />
                    {msg.consolidationRef}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/20">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-9 bg-background"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
