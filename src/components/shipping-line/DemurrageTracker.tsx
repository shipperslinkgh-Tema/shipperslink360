import { AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemurrageItem {
  id: string;
  containerNo: string;
  customer: string;
  daysOverdue: number;
  estimatedCharge: number;
  type: "demurrage" | "detention";
}

const demurrageItems: DemurrageItem[] = [
  {
    id: "1",
    containerNo: "HLCU2345678",
    customer: "Ghana Importers Ltd",
    daysOverdue: 5,
    estimatedCharge: 750,
    type: "demurrage",
  },
  {
    id: "2",
    containerNo: "MSKU9876543",
    customer: "Accra Traders",
    daysOverdue: 3,
    estimatedCharge: 450,
    type: "detention",
  },
  {
    id: "3",
    containerNo: "MSCU4567890",
    customer: "West Coast Imports",
    daysOverdue: 2,
    estimatedCharge: 300,
    type: "demurrage",
  },
];

const upcomingExpiry = [
  { containerNo: "CMAU1234567", customer: "Tema Foods", expiresIn: 1 },
  { containerNo: "COSU7890123", customer: "Gold Traders", expiresIn: 2 },
  { containerNo: "MSKU3456789", customer: "Electronics Plus", expiresIn: 3 },
];

export function DemurrageTracker() {
  const totalCharges = demurrageItems.reduce((sum, item) => sum + item.estimatedCharge, 0);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-destructive/10 p-2">
            <DollarSign className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Demurrage & Detention</h3>
            <p className="text-xs text-muted-foreground">Active charges to address</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-destructive">
            ${totalCharges.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">estimated</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {demurrageItems.length} containers with overdue free days
        </p>
      </div>

      {/* Overdue List */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Overdue Containers
        </h4>
        <div className="space-y-3">
          {demurrageItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-medium">{item.containerNo}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  item.type === "demurrage" 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-warning/10 text-warning"
                )}>
                  {item.type === "demurrage" ? "Demurrage" : "Detention"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{item.customer}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-destructive font-medium">
                  {item.daysOverdue} days overdue
                </span>
                <span className="font-semibold">${item.estimatedCharge}</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Charges
        </Button>
      </div>

      {/* Expiring Soon */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          Free Days Expiring Soon
        </h4>
        <div className="space-y-2">
          {upcomingExpiry.map((item) => (
            <div
              key={item.containerNo}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <span className="font-mono text-sm">{item.containerNo}</span>
                <p className="text-xs text-muted-foreground">{item.customer}</p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded",
                item.expiresIn === 1 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-warning/10 text-warning"
              )}>
                {item.expiresIn === 1 ? "Tomorrow" : `${item.expiresIn} days`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
