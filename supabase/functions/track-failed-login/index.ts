import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email in profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id, failed_login_attempts, is_locked")
      .eq("email", email)
      .single();

    if (!profile || profile.is_locked) {
      // Don't reveal whether user exists
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment failed attempts
    await supabaseAdmin.rpc("increment_failed_login", {
      _user_id: profile.user_id,
    });

    // Log failed attempt
    await supabaseAdmin.from("login_history").insert({
      user_id: profile.user_id,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      success: false,
    });

    // Log audit trail
    await supabaseAdmin.from("audit_logs").insert({
      user_id: profile.user_id,
      action: "failed_login",
      resource_type: "auth",
      resource_id: profile.user_id,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      details: {
        attempt_number: profile.failed_login_attempts + 1,
        locked: profile.failed_login_attempts + 1 >= 5,
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    // Never reveal internal errors
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
