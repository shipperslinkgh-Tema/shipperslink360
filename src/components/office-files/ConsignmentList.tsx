import { Ship, Plane, Lock, FileText, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompletedConsignment } from "@/hooks/useCompletedConsignments";

interface Props {
  consignments: CompletedConsignment[];
  isLoading: boolean;
  docCounts?: Record<string, number>;
  onSelect: (id: string) => void;
}

/** One consignment rendered as a manila-folder style card. */
function FolderCard({
  consignment: c,
  docCount,
  onSelect,
}: {
  consignment: CompletedConsignment;
  docCount: number;
  onSelect: (id: string) => void;
}) {
  const isSea = c.shipment_type === "sea";

  return (
    <button
      onClick={() => onSelect(c.id)}
      className="group relative text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-b-xl rounded-tr-xl"
    >
      {/* Folder tab */}
      <div
        className={cn(
          "absolute -top-2.5 left-3 h-3 w-24 rounded-t-md transition-colors",
          "bg-warning/50 group-hover:bg-warning/70"
        )}
      />
      {/* Folder body */}
      <div
        className={cn(
          "rounded-b-xl rounded-tr-xl border border-warning/40 bg-warning/10 p-4 pt-5 h-full",
          "transition-all group-hover:bg-warning/20 group-hover:shadow-md group-hover:-translate-y-0.5"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="h-5 w-5 shrink-0 text-warning-foreground/70" />
            <span className="font-semibold text-sm text-foreground truncate">
              {c.consignment_ref}
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0 gap-1",
              isSea ? "text-primary border-primary/40" : "text-info border-info/40"
            )}
          >
            {isSea ? <Ship className="h-3 w-3" /> : <Plane className="h-3 w-3" />}
            {isSea ? "Sea" : "Air"}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground truncate mt-2">{c.client_name}</p>

        <div className="mt-3 space-y-1 text-[11px] text-muted-foreground font-mono">
          <p className="truncate">
            {isSea ? "BL" : "AWB"}: {c.bl_number || c.awb_number || "—"}
          </p>
          {c.declaration_number && (
            <p className="truncate">Decl: {c.declaration_number}</p>
          )}
          {c.terminal && <p className="truncate">Terminal: {c.terminal}</p>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-warning/30 pt-2">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <FileText className="h-3 w-3" />
            {docCount} {docCount === 1 ? "document" : "documents"}
          </span>
          {c.is_locked && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ConsignmentList({ consignments, isLoading, docCounts = {}, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (consignments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">No consignment folders found</p>
        <p className="text-sm">Create a new consignment to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6 pt-3">
      {consignments.map((c) => (
        <FolderCard
          key={c.id}
          consignment={c}
          docCount={docCounts[c.id] || 0}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
