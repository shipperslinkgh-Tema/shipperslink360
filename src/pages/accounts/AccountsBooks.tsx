import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Receipt, BookOpen } from "lucide-react";
import AccountsInvoices from "./AccountsInvoices";
import AccountsVouchers from "./AccountsVouchers";
import AccountsLedgers from "./AccountsLedgers";

export default function AccountsBooks() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") || "invoices";
  const [tab, setTab] = useState(initial);

  const handleChange = (v: string) => {
    setTab(v);
    setParams({ tab: v }, { replace: true });
  };

  return (
    <Tabs value={tab} onValueChange={handleChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="invoices" className="gap-2"><FileText className="h-4 w-4" />Invoices</TabsTrigger>
        <TabsTrigger value="vouchers" className="gap-2"><Receipt className="h-4 w-4" />Vouchers</TabsTrigger>
        <TabsTrigger value="ledgers" className="gap-2"><BookOpen className="h-4 w-4" />Ledgers</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices" className="mt-0"><AccountsInvoices /></TabsContent>
      <TabsContent value="vouchers" className="mt-0"><AccountsVouchers /></TabsContent>
      <TabsContent value="ledgers" className="mt-0"><AccountsLedgers /></TabsContent>
    </Tabs>
  );
}
