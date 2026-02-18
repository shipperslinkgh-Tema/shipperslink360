import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAIChat, AIMessage } from "@/hooks/useAIChat";
import ReactMarkdown from "react-markdown";

interface AIChatPanelProps {
  module: string;
  moduleLabel: string;
  placeholder?: string;
  welcomeMessage?: string;
  className?: string;
}

export function AIChatPanel({ module, moduleLabel, placeholder, welcomeMessage, className }: AIChatPanelProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat(module);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const defaultWelcome = `Hello! I'm your AI assistant for the **${moduleLabel}** module. How can I help you today?`;

  return (
    <div className={cn("flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">SLAC AI Assistant</h3>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5">{moduleLabel}</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={clearMessages}
          title="Clear conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome */}
          <div className="flex gap-3">
            <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 rounded-xl rounded-tl-none p-3">
              <div className="prose prose-sm max-w-none text-foreground text-sm">
                <ReactMarkdown>{welcomeMessage || defaultWelcome}</ReactMarkdown>
              </div>
            </div>
          </div>

          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onCopy={() => copyToClipboard(msg.content, `msg-${i}`)}
              copied={copied === `msg-${i}`}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 rounded-xl rounded-tl-none p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask me anything... (Enter to send, Shift+Enter for new line)"}
            className="flex-1 min-h-[60px] max-h-32 bg-background text-sm resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          AI responses are for guidance only. Always verify critical information.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy, copied }: {
  message: AIMessage;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-none p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
      </Avatar>
      <div className="flex-1 group">
        <div className="bg-muted/50 rounded-xl rounded-tl-none p-3 relative">
          <div className="prose prose-sm max-w-none text-foreground text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          {message.content && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
