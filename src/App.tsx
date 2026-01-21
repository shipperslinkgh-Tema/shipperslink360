import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shipments from "./pages/Shipments";
import ICUMSDeclarations from "./pages/ICUMSDeclarations";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

// Wrapper component for pages that need the layout
const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/shipments"
            element={
              <WithLayout>
                <Shipments />
              </WithLayout>
            }
          />
          <Route
            path="/shipments/:type"
            element={
              <WithLayout>
                <Shipments />
              </WithLayout>
            }
          />
          <Route
            path="/customs/icums"
            element={
              <WithLayout>
                <ICUMSDeclarations />
              </WithLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
