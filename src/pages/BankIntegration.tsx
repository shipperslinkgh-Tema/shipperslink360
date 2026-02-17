import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BankConnectionsPanel } from "@/components/banking/BankConnectionsPanel";
import { BankTransactionsTable } from "@/components/banking/BankTransactionsTable";
import { BankAlertsPanel } from "@/components/banking/BankAlertsPanel";
import { BankReconciliationPanel } from "@/components/banking/BankReconciliationPanel";
import {
  Landmark,
  ArrowLeftRight,
  Bell,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BankIntegration = () => {
  const [activeTab, setActiveTab] = useState("connections");
  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('bank-sync', {
        body: { action: 'sync_balance' },
      });
      if (error) throw error;
      toast.success("Bank data synced successfully");
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Bank Integration</h1>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Access Bank, Ecobank, GCB PLC & ADB — Real-time balances, transactions & reconciliation
          </p>
        </div>
        <Button onClick={handleSyncAll} disabled={syncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync All Banks
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="connections" className="gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Reconciliation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <BankConnectionsPanel />
        </TabsContent>
        <TabsContent value="transactions">
          <BankTransactionsTable />
        </TabsContent>
        <TabsContent value="alerts">
          <BankAlertsPanel />
        </TabsContent>
        <TabsContent value="reconciliation">
          <BankReconciliationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankIntegration;
