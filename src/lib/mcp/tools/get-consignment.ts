import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_consignment",
  title: "Get consignment",
  description:
    "Fetch one consignment workflow by its consignment reference, including its recent tracking events.",
  inputSchema: {
    consignment_ref: z.string().describe("The consignment reference, e.g. 'CNS-2026-0012'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ consignment_ref }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("consignment_workflows")
      .select("*")
      .eq("consignment_ref", consignment_ref)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: `No consignment found for ${consignment_ref}` }],
        isError: true,
      };
    }
    const { data: events } = await supabase
      .from("consignment_events")
      .select("*")
      .eq("workflow_id", (data as { id: string }).id)
      .order("created_at", { ascending: false })
      .limit(20);
    return {
      content: [{ type: "text", text: JSON.stringify({ consignment: data, events: events ?? [] }) }],
      structuredContent: { consignment: data, events: events ?? [] },
    };
  },
});
