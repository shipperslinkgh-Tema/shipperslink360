import { CheckCircle2, Circle, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ClearanceJob {
  id: string;
  blNumber: string;
  customer: string;
  icums: "cleared" | "pending" | "issue";
  shippingLine: "cleared" | "pending" | "issue";
  gpha: "cleared" | "pending" | "issue";
}

const jobs: ClearanceJob[] = [
  {
    id: "1",
    blNumber: "MSKU2345678",
    customer: "Gold Coast Trading",
    icums: "cleared",
    shippingLine: "cleared",
    gpha: "pending",
  },
  {
    id: "2",
    blNumber: "AWB-7890123",
    customer: "Accra Electronics",
    icums: "pending",
    shippingLine: "cleared",
    gpha: "pending",
  },
  {
    id: "3",
    blNumber: "COSU8901234",
    customer: "West Africa Motors",
    icums: "cleared",
    shippingLine: "issue",
    gpha: "pending",
  },
];

const getStatusIcon = (status: "cleared" | "pending" | "issue") => {
  switch (status) {
    case "cleared":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "pending":
      return <Circle className="h-4 w-4 text-warning" />;
    case "issue":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
};

const allCleared = (job: ClearanceJob) =>
  job.icums === "cleared" && job.shippingLine === "cleared" && job.gpha === "cleared";

export function ClearanceStatusWidget() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Clearance Status</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" /> Cleared
          </span>
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-warning" /> Pending
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-destructive" /> Issue
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              allCleared(job) ? "border-success/30 bg-success/5" : "border-border hover:bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-sm font-medium text-foreground">{job.blNumber}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{job.customer}</p>
              </div>
              {allCleared(job) && (
                <span className="status-badge status-success">Ready for Release</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  {getStatusIcon(job.icums)}
                  <span className="text-[10px] text-muted-foreground mt-1">ICUMS</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                <div className="flex flex-col items-center">
                  {getStatusIcon(job.shippingLine)}
                  <span className="text-[10px] text-muted-foreground mt-1">DO</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                <div className="flex flex-col items-center">
                  {getStatusIcon(job.gpha)}
                  <span className="text-[10px] text-muted-foreground mt-1">GPHA</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="text-accent hover:text-accent h-7">
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All Clearances
      </Button>
    </div>
  );
}
