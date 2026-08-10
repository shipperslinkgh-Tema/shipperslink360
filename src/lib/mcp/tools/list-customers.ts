import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_customers",
  title: "List customers",
  description: "List customers visible to the signed-in user, optionally filtered by a name search.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
    search: z.string().optional().describe("Match part of the customer name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (search) query = query.ilike("company_name", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { customers: data ?? [] },
    };
  },
});
