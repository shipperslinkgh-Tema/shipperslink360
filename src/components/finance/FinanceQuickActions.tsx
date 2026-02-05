import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Receipt,
  CreditCard,
  FileCheck,
  Calculator,
  Download,
  Upload,
  Printer,
  Send,
  Plus,
} from "lucide-react";

interface FinanceQuickActionsProps {
  onNewInvoice?: () => void;
  onRecordPayment?: () => void;
  onRecordReceipt?: () => void;
  onNewPayable?: () => void;
  onRecordDuty?: () => void;
  onExportReport?: () => void;
}

export function FinanceQuickActions({
  onNewInvoice,
  onRecordPayment,
  onRecordReceipt,
  onNewPayable,
  onRecordDuty,
  onExportReport,
}: FinanceQuickActionsProps) {
  const quickActions = [
    {
      label: "New Invoice",
      description: "Create proforma or commercial",
      icon: FileText,
      onClick: onNewInvoice,
      variant: "default" as const,
    },
    {
      label: "Record Payment",
      description: "Cash, bank, or MoMo",
      icon: CreditCard,
      onClick: onRecordPayment,
      variant: "outline" as const,
    },
    {
      label: "Record Receipt",
      description: "Issue customer receipt",
      icon: Receipt,
      onClick: onRecordReceipt,
      variant: "outline" as const,
    },
    {
      label: "Add Payable",
      description: "Vendor/shipping line bill",
      icon: FileCheck,
      onClick: onNewPayable,
      variant: "outline" as const,
    },
    {
      label: "Record Duty",
      description: "ICUMS customs payment",
      icon: Calculator,
      onClick: onRecordDuty,
      variant: "outline" as const,
    },
    {
      label: "Export Report",
      description: "Download financial data",
      icon: Download,
      onClick: onExportReport,
      variant: "secondary" as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto flex-col gap-2 py-4 px-3"
            >
              <action.icon className="h-5 w-5" />
              <div className="text-center">
                <p className="text-xs font-medium">{action.label}</p>
                <p className="text-[10px] text-muted-foreground font-normal hidden sm:block">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
