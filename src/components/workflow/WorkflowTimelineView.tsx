import { WorkflowTimelineEvent } from "@/types/workflow";
import { cn } from "@/lib/utils";
import { FileText, ArrowRight, Upload, MessageSquare, UserCheck, Bell } from "lucide-react";
import { format } from "date-fns";

interface WorkflowTimelineViewProps {
  events: WorkflowTimelineEvent[];
  className?: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  stage_change: <ArrowRight className="h-4 w-4" />,
  document_upload: <Upload className="h-4 w-4" />,
  note_added: <MessageSquare className="h-4 w-4" />,
  assignment: <UserCheck className="h-4 w-4" />,
  status_update: <FileText className="h-4 w-4" />,
  notification_sent: <Bell className="h-4 w-4" />,
};

const eventColors: Record<string, string> = {
  stage_change: "bg-primary text-primary-foreground",
  document_upload: "bg-blue-500 text-white",
  note_added: "bg-amber-500 text-white",
  assignment: "bg-green-500 text-white",
  status_update: "bg-purple-500 text-white",
  notification_sent: "bg-orange-500 text-white",
};

export function WorkflowTimelineView({ events, className }: WorkflowTimelineViewProps) {
  if (!events.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 pl-10">
            <div
              className={cn(
                "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                eventColors[event.event_type] || "bg-muted text-muted-foreground"
              )}
            >
              {eventIcons[event.event_type] || <FileText className="h-3 w-3" />}
            </div>

            <div className="flex-1 bg-card border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              )}
              {event.performed_by_name && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  By: {event.performed_by_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
