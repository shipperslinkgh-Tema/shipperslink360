import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2, Copy, Check, Paperclip, X, FileText, Image as ImageIcon, MessageSquarePlus, History, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAIChat, AIMessage } from "@/hooks/useAIChat";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface PendingAttachment {
  file: File;
  kind: "image" | "pdf" | "text";
  dataUrl?: string; // for images
  extractedText?: string; // for pdf/text
}

const MAX_FILE_MB = 10;

interface AIChatPanelProps {
  module: string;
  moduleLabel: string;
  placeholder?: string;
  welcomeMessage?: string;
  className?: string;
}

export function AIChatPanel({ module, moduleLabel, placeholder, welcomeMessage, className }: AIChatPanelProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    conversations,
    conversationId,
    loadConversation,
    newConversation,
    deleteConversation,
  } = useAIChat(module);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { processDocument, isProcessing } = useDocumentProcessor();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const readFileAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsText(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_FILE_MB}MB limit`);
        continue;
      }
      try {
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          const dataUrl = await readFileAsDataUrl(file);
          setAttachments(prev => [
            ...prev,
            { file, kind: file.type === "application/pdf" ? "pdf" : "image", dataUrl },
          ]);
        } else if (
          file.type.startsWith("text/") ||
          /\.(txt|csv|json|md|log|xml|yaml|yml)$/i.test(file.name)
        ) {
          const text = await readFileAsText(file);
          const truncated = text.length > 50000 ? text.slice(0, 50000) + "\n...[truncated]" : text;
          setAttachments(prev => [...prev, { file, kind: "text", extractedText: `[Contents of ${file.name}]\n${truncated}` }]);
        } else {
          toast.error(`Unsupported file type: ${file.name}`);
        }
      } catch (err) {
        console.error(err);
        toast.error(`Failed to read ${file.name}`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isLoading || isProcessing) return;

    if (attachments.length === 0) {
      sendMessage(text);
    } else {
      const parts: Array<
        { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
      > = [];
      const textParts: string[] = [];
      if (text) textParts.push(text);
      for (const a of attachments) {
        if ((a.kind === "image" || a.kind === "pdf") && a.dataUrl) {
          parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
        } else if (a.extractedText) {
          textParts.push(a.extractedText);
        }
      }
      parts.unshift({ type: "text", text: textParts.join("\n\n") || "Please review the attached file(s)." });
      sendMessage(parts);
    }
    setInput("");
    setAttachments([]);
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const defaultWelcome = `Hello! I'm your AI assistant for the **${moduleLabel}** module. How can I help you today?`;

  return (
    <div className={cn("flex h-full bg-card border border-border rounded-xl overflow-hidden", className)}>
      {/* History sidebar */}
      {historyOpen && (
        <div className="w-56 border-r border-border bg-muted/30 flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">History</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={newConversation}
              title="New chat"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-[11px] text-muted-foreground px-2 py-3 text-center">
                  No saved chats yet
                </p>
              ) : (
                conversations.map(c => (
                  <div
                    key={c.id}
                    className={cn(
                      "group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted text-xs",
                      conversationId === c.id && "bg-muted"
                    )}
                    onClick={() => loadConversation(c.id)}
                  >
                    <MessageSquare className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground">{c.title}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        deleteConversation(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setHistoryOpen(v => !v)}
            title="Chat history"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={newConversation}
            title="New chat"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={clearMessages}
            title="Clear current view"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
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

          {messages.map((msg, i) => {
            const textForCopy =
              typeof msg.content === "string"
                ? msg.content
                : msg.content
                    .map(p => (p.type === "text" ? p.text : "[image]"))
                    .join("\n");
            return (
              <MessageBubble
                key={i}
                message={msg}
                onCopy={() => copyToClipboard(textForCopy, `msg-${i}`)}
                copied={copied === `msg-${i}`}
              />
            );
          })}

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
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((a, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-background border border-border rounded-lg pl-2 pr-1 py-1 text-xs"
              >
                {a.kind === "image" ? (
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-primary" />
                )}
                <span className="max-w-[140px] truncate">{a.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/*,.csv,.json,.md,.log,.xml,.yaml,.yml,.txt"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessing}
            className="h-9 w-9 flex-shrink-0"
            title="Attach images, PDFs, or text files"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
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
            disabled={(!input.trim() && attachments.length === 0) || isLoading || isProcessing}
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
          Attach images, PDFs, or text files (max {MAX_FILE_MB}MB). AI responses are for guidance only.
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

  // Normalize content for rendering
  const textContent =
    typeof message.content === "string"
      ? message.content
      : message.content.filter(p => p.type === "text").map(p => (p as any).text).join("\n\n");
  const imageUrls =
    typeof message.content === "string"
      ? []
      : message.content.filter(p => p.type === "image_url").map(p => (p as any).image_url.url as string);

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-none p-3 space-y-2">
          {imageUrls.map((url, i) => (
            <img key={i} src={url} alt="attachment" className="rounded-md max-h-48 object-contain" />
          ))}
          {textContent && <p className="text-sm whitespace-pre-wrap">{textContent}</p>}
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
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
          {textContent && (
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
