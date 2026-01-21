import { Bell, Search, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shipments, BL numbers, customers..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Integration Status */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-muted/50 mr-2">
          <div className="flex items-center gap-2">
            <span className="integration-dot integration-connected" />
            <span className="text-xs font-medium text-muted-foreground">ICUMS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="integration-dot integration-connected" />
            <span className="text-xs font-medium text-muted-foreground">GPHA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="integration-dot integration-pending" />
            <span className="text-xs font-medium text-muted-foreground">ODeX</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-card">
            5
          </Badge>
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
