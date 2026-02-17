import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BANK_OPTIONS = [
  { value: "access_bank", label: "Access Bank Ghana", color: "bg-orange-500" },
  { value: "ecobank", label: "Ecobank Ghana", color: "bg-blue-600" },
  { value: "gcb", label: "GCB Bank PLC", color: "bg-green-600" },
  { value: "adb", label: "Agricultural Development Bank", color: "bg-yellow-600" },
];

export function BankConnectionsPanel() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    account_type: "current",
    currency: "GHS",
  });

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["bank-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_connections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addConnection = useMutation({
    mutationFn: async () => {
      const bankOption = BANK_OPTIONS.find(b => b.value === form.bank_name);
      const { error } = await supabase.from("bank_connections").insert({
        bank_name: form.bank_name,
        bank_display_name: bankOption?.label || form.bank_name,
        account_number: form.account_number,
        account_name: form.account_name,
        account_type: form.account_type,
        currency: form.currency,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-connections"] });
      toast.success("Bank account added");
      setOpen(false);
      setForm({ bank_name: "", account_number: "", account_name: "", account_type: "current", currency: "GHS" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const syncBank = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase.functions.invoke("bank-sync", {
        body: { action: "sync_balance", bankConnectionId: connectionId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-connections"] });
      toast.success("Synced successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getBankColor = (bankName: string) => {
    return BANK_OPTIONS.find(b => b.value === bankName)?.color || "bg-muted";
  };

  const totalBalance = connections.reduce((sum, c) => sum + Number(c.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Balance (All Banks)</p>
            <p className="text-2xl font-bold mt-1">GHS {totalBalance.toLocaleString("en-GH", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        {BANK_OPTIONS.map(bank => {
          const conn = connections.find(c => c.bank_name === bank.value);
          return (
            <Card key={bank.value}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", bank.color)} />
                  <p className="text-sm text-muted-foreground">{bank.label}</p>
                </div>
                <p className="text-xl font-bold mt-1">
                  {conn ? `GHS ${Number(conn.balance || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "Not Connected"}
                </p>
                {conn && (
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(conn.sync_status)}
                    <span className="text-xs text-muted-foreground capitalize">{conn.sync_status}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connections List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Connected Bank Accounts
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Bank Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Bank</Label>
                    <Select value={form.bank_name} onValueChange={v => setForm(f => ({ ...f, bank_name: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                      <SelectContent>
                        {BANK_OPTIONS.map(b => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Account Name</Label>
                    <Input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} placeholder="e.g. Shippers Link - Operating" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} placeholder="Enter account number" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Account Type</Label>
                      <Select value={form.account_type} onValueChange={v => setForm(f => ({ ...f, account_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GHS">GHS</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => addConnection.mutate()} disabled={!form.bank_name || !form.account_number || !form.account_name}>
                    Add Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts connected yet.</p>
              <p className="text-sm mt-1">Add your Access Bank, Ecobank, GCB or ADB accounts to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map(conn => (
                <div key={conn.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white", getBankColor(conn.bank_name))}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{conn.bank_display_name}</p>
                      <p className="text-sm text-muted-foreground">{conn.account_name} • {conn.account_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{conn.currency} {Number(conn.balance || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}</p>
                      <div className="flex items-center gap-1 justify-end">
                        {getStatusIcon(conn.sync_status)}
                        <span className="text-xs text-muted-foreground">
                          {conn.last_sync_at ? `Synced ${new Date(conn.last_sync_at).toLocaleString()}` : "Never synced"}
                        </span>
                      </div>
                    </div>
                    {conn.error_message && (
                      <Badge variant="destructive" className="text-xs">{conn.error_message}</Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => syncBank.mutate(conn.id)} disabled={syncBank.isPending}>
                      <RefreshCw className={cn("h-4 w-4", syncBank.isPending && "animate-spin")} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
