import Dashboard from "./Dashboard";
import OperationsDashboard from "./dashboards/OperationsDashboard";
import DocumentationDashboard from "./dashboards/DocumentationDashboard";
import AccountsDashboard from "./dashboards/AccountsDashboard";
import FleetDashboard from "./dashboards/FleetDashboard";
import MarketingDashboard from "./dashboards/MarketingDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAdmin, department } = useAuth();

  const renderDashboard = () => {
    if (isAdmin || department === "management" || department === "super_admin") return <Dashboard />;
    switch (department) {
      case "operations": return <OperationsDashboard />;
      case "documentation": return <DocumentationDashboard />;
      case "accounts": return <AccountsDashboard />;
      case "warehouse": return <FleetDashboard />;
      case "marketing": return <MarketingDashboard />;
      case "customer_service": return <MarketingDashboard />;
      default: return <Dashboard />;
    }
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
};

export default Index;
