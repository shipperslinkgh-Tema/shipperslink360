import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { InternalChatBox } from "@/components/chat/InternalChatBox";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64 transition-all duration-300">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
      <InternalChatBox isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}
