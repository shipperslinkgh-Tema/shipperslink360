import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ClientAuthProvider, useClientAuth } from "@/contexts/ClientAuthContext";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import Shipments from "./pages/Shipments";
import Reports from "./pages/Reports";
import ICUMSDeclarations from "./pages/ICUMSDeclarations";
import ShippingLineStatus from "./pages/ShippingLineStatus";
import GPHAPortStatus from "./pages/GPHAPortStatus";
import Trucking from "./pages/Trucking";
import Customers from "./pages/Customers";
import Finance from "./pages/Finance";
import Invoicing from "./pages/Invoicing";
import Payments from "./pages/Payments";
import BankIntegration from "./pages/BankIntegration";
import Presentation from "./pages/Presentation";
import ConsolidationPortal from "./pages/ConsolidationPortal";
import AdminUsers from "./pages/AdminUsers";
import SettingsPage from "./pages/Settings";
import ClientDocumentManagement from "./pages/ClientDocumentManagement";
import ClientDataManagement from "./pages/ClientDataManagement";
import Index from "./pages/Index";
import Warehouse from "./pages/Warehouse";
import AIAssistant from "./pages/AIAssistant";
import { AppLayout } from "./components/layout/AppLayout";
import ClientLogin from "./pages/client/ClientLogin";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientShipments from "./pages/client/ClientShipments";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientMessages from "./pages/client/ClientMessages";
import { ClientPortalLayout } from "./components/layout/ClientPortalLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.must_change_password) return <Navigate to="/change-password" replace />;

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ClientProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, clientProfile } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session || !clientProfile) return <Navigate to="/portal/login" replace />;

  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}

function ClientAuthRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, clientProfile } = useClientAuth();
  if (loading) return null;
  if (session && clientProfile) return <Navigate to="/portal" replace />;
  return <>{children}</>;
}

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
          {/* Client Portal Routes */}
          <Route path="/portal/*" element={
            <ClientAuthProvider>
              <Routes>
                <Route path="/login" element={<ClientAuthRoute><ClientLogin /></ClientAuthRoute>} />
                <Route path="/" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                <Route path="/shipments" element={<ClientProtectedRoute><ClientShipments /></ClientProtectedRoute>} />
                <Route path="/documents" element={<ClientProtectedRoute><ClientDocuments /></ClientProtectedRoute>} />
                <Route path="/invoices" element={<ClientProtectedRoute><ClientInvoices /></ClientProtectedRoute>} />
                <Route path="/messages" element={<ClientProtectedRoute><ClientMessages /></ClientProtectedRoute>} />
              </Routes>
            </ClientAuthProvider>
          } />

          {/* Staff Routes */}
          <Route path="/*" element={
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/shipments" element={<ProtectedRoute><WithLayout><Shipments /></WithLayout></ProtectedRoute>} />
                <Route path="/shipments/:type" element={<ProtectedRoute><WithLayout><Shipments /></WithLayout></ProtectedRoute>} />
                <Route path="/customs/icums" element={<ProtectedRoute><WithLayout><ICUMSDeclarations /></WithLayout></ProtectedRoute>} />
                <Route path="/shipping-lines" element={<ProtectedRoute><WithLayout><ShippingLineStatus /></WithLayout></ProtectedRoute>} />
                <Route path="/trucking" element={<ProtectedRoute><WithLayout><Trucking /></WithLayout></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><WithLayout><Customers /></WithLayout></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute><WithLayout><Finance /></WithLayout></ProtectedRoute>} />
                <Route path="/finance/invoices" element={<ProtectedRoute><WithLayout><Invoicing /></WithLayout></ProtectedRoute>} />
                <Route path="/finance/payments" element={<ProtectedRoute><WithLayout><Payments /></WithLayout></ProtectedRoute>} />
                <Route path="/finance/reports" element={<ProtectedRoute><WithLayout><Finance /></WithLayout></ProtectedRoute>} />
                <Route path="/finance/banking" element={<ProtectedRoute><WithLayout><BankIntegration /></WithLayout></ProtectedRoute>} />
                <Route path="/customs/gpha" element={<ProtectedRoute><WithLayout><GPHAPortStatus /></WithLayout></ProtectedRoute>} />
                <Route path="/consolidation" element={<ProtectedRoute><WithLayout><ConsolidationPortal /></WithLayout></ProtectedRoute>} />
                <Route path="/warehouse" element={<ProtectedRoute><WithLayout><Warehouse /></WithLayout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><WithLayout><Reports /></WithLayout></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><WithLayout><AIAssistant /></WithLayout></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><WithLayout><AdminUsers /></WithLayout></ProtectedRoute>} />
                <Route path="/admin/client-documents" element={<ProtectedRoute><WithLayout><ClientDocumentManagement /></WithLayout></ProtectedRoute>} />
                <Route path="/admin/client-data" element={<ProtectedRoute><WithLayout><ClientDataManagement /></WithLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><WithLayout><SettingsPage /></WithLayout></ProtectedRoute>} />
                <Route path="/presentation" element={<Presentation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
