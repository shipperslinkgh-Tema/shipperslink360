import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_trips",
  title: "List trucking trips",
  description: "List trucking trips visible to the signed-in user, newest first, optionally filtered by status.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
    status: z
      .string()
      .optional()
      .describe("Filter by trip status: scheduled, in_transit, delivered, completed or cancelled."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("trucking_trips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { trips: data ?? [] },
    };
  },
});
