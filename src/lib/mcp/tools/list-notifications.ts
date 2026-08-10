import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_notifications",
  title: "List notifications",
  description: "List the signed-in user's notifications, newest first. Optionally only unread ones.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
    unread_only: z.boolean().optional().describe("When true, return only unread notifications."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, unread_only }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (unread_only) query = query.eq("is_read", false);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { notifications: data ?? [] },
    };
  },
});
