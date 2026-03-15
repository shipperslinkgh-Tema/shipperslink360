import { Card, CardContent } from "@/components/ui/card";
import { Ship, FileCheck, Clock, Truck, AlertTriangle, Container, Anchor, Timer } from "lucide-react";
import type { PortStats } from "@/hooks/usePortCommandData";
import { cn } from "@/lib/utils";

interface PortStatsBarProps {
  stats: PortStats;
}

const statItems = [
  { key: "totalActive", label: "Active", icon: Container, color: "text-primary" },
  { key: "atPort", label: "At Port", icon: Anchor, color: "text-blue-500" },
  { key: "inCustoms", label: "In Customs", icon: FileCheck, color: "text-purple-500" },
  { key: "awaitingRelease", label: "Awaiting Release", icon: Clock, color: "text-amber-500" },
  { key: "inDelivery", label: "In Delivery", icon: Truck, color: "text-teal-500" },
  { key: "urgent", label: "Urgent", icon: AlertTriangle, color: "text-destructive" },
  { key: "demurrageAtRisk", label: "Demurrage Risk", icon: Timer, color: "text-orange-500" },
] as const;

export function PortStatsBar({ stats }: PortStatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statItems.map((item) => (
        <Card key={item.key} className={cn(
          "transition-all hover:shadow-md",
          item.key === "demurrageAtRisk" && stats[item.key] > 0 && "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20",
          item.key === "urgent" && stats[item.key] > 0 && "border-destructive/50 bg-destructive/5"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <item.icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground leading-tight">
                  {stats[item.key]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
