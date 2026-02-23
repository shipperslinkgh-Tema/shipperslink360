import { Ship, Plane, Lock, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompletedConsignment } from "@/hooks/useCompletedConsignments";

interface Props {
  consignments: CompletedConsignment[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

export function ConsignmentList({ consignments, isLoading, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (consignments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Lock className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">No archived consignments found</p>
        <p className="text-sm">Create a new consignment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {consignments.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            "w-full text-left rounded-xl border border-border/50 bg-card p-4",
            "hover:border-primary/30 hover:shadow-md transition-all",
            "flex items-center gap-4"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            c.shipment_type === "sea" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
          )}>
            {c.shipment_type === "sea" ? <Ship className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground truncate">{c.consignment_ref}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">
                <Lock className="h-3 w-3 mr-1" /> Completed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {c.client_name} • {c.bl_number || c.awb_number || "—"}
              {c.container_numbers?.length > 0 && ` • ${c.container_numbers.join(", ")}`}
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {c.delivery_date ? new Date(c.delivery_date).toLocaleDateString() : "—"}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {c.officer_in_charge}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
