import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const friendlyProfileError = (message: string) => {
  if (message.includes("profiles_staff_id_key")) return "This Staff ID is already in use.";
  if (message.includes("profiles_email_key")) return "This email is already used by another staff profile.";
  if (message.includes("profiles_username_key")) return "This username is already taken.";
  return `Profile creation failed: ${message}`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const callerId = claimsData.claims.sub;

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const isAdmin = callerRoles?.some(r => r.role === "super_admin" || r.role === "admin");
    if (!isAdmin) {
      return jsonResponse({ error: "Forbidden: Admin access required" }, 403);
    }

    const body = await req.json();
    const full_name = String(body.full_name || "").trim();
    const staff_id = String(body.staff_id || "").trim();
    const department = String(body.department || "").trim();
    const role = String(body.role || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!full_name || !staff_id || !department || !role || !email || !username || !password) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const [{ data: existingStaff }, { data: existingEmail }, { data: existingUsername }] = await Promise.all([
      adminClient.from("profiles").select("id").eq("staff_id", staff_id).maybeSingle(),
      adminClient.from("profiles").select("id").eq("email", email).maybeSingle(),
      adminClient.from("profiles").select("id").eq("username", username).maybeSingle(),
    ]);

    if (existingStaff) return jsonResponse({ error: "This Staff ID is already in use." }, 400);
    if (existingEmail) return jsonResponse({ error: "This email is already used by another staff profile." }, 400);
    if (existingUsername) return jsonResponse({ error: "This username is already taken." }, 400);

    const { data: existingAuthUser } = await adminClient.auth.admin.listUsers();
    const emailAlreadyRegistered = existingAuthUser?.users?.some(
      (user) => user.email?.toLowerCase() === email,
    );

    if (emailAlreadyRegistered) {
      return jsonResponse({ error: "This email already has an account." }, 400);
    }

    // Create auth user with admin client (bypasses signup disabled)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, staff_id, department },
    });

    if (createError) {
      return jsonResponse({ error: createError.message }, 400);
    }

    // Create profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: newUser.user.id,
      full_name,
      staff_id,
      department,
      email,
      phone: phone || null,
      username,
      must_change_password: true,
    });

    if (profileError) {
      // Roll back auth user so admin can retry with corrected fields
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return jsonResponse({ error: friendlyProfileError(profileError.message) }, 400);
    }

    // Assign role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
    });

    if (roleError) {
      await adminClient.from("profiles").delete().eq("user_id", newUser.user.id);
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return jsonResponse({ error: `Role assignment failed: ${roleError.message}` }, 400);
    }

    // Audit log
    await adminClient.from("audit_logs").insert({
      user_id: callerId,
      action: "create_user",
      resource_type: "user",
      resource_id: newUser.user.id,
      details: { created_user_email: email, department, role },
    });

    return jsonResponse({ success: true, user_id: newUser.user.id });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
});
