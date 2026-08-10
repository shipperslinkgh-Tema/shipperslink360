import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_consignments",
  title: "List consignments",
  description:
    "List consignment workflows (shipments) visible to the signed-in user, newest first. Optionally filter by workflow stage or search by consignment reference.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
    stage: z.string().optional().describe("Filter by workflow stage, e.g. 'at_port'."),
    search: z.string().optional().describe("Match part of the consignment reference."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, stage, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("consignment_workflows")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (stage) query = query.eq("current_stage", stage);
    if (search) query = query.ilike("consignment_ref", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { consignments: data ?? [] },
    };
  },
});
