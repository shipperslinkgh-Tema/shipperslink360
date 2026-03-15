import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { InternalChatBox } from "@/components/chat/InternalChatBox";
import { usePresence } from "@/hooks/usePresence";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();
  usePresence();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className={isMobile ? "pl-0 transition-all duration-300" : "pl-64 transition-all duration-300"}>
        <TopBar />
        <main className={isMobile ? "p-3 pb-20" : "p-6"}>{children}</main>
      </div>
      {!isMobile && (
        <InternalChatBox isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
      )}
    </div>
  );
}
