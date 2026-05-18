import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: userError } = await callerClient.auth.getUser();
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = caller.id;
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const isAdmin = callerRoles?.some(r => r.role === "super_admin" || r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { customer_id, company_name, contact_name, email, phone, password, tin_number, warehouse_destinations } = await req.json();

    if (!customer_id || !company_name || !contact_name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Pre-check: customer_id already used
    const { data: existingCustomer } = await adminClient
      .from("client_profiles")
      .select("id")
      .eq("customer_id", customer_id)
      .maybeSingle();
    if (existingCustomer) {
      return new Response(JSON.stringify({ error: "A client with this Customer ID already exists." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pre-check: email already registered as auth user or client
    const { data: existingClient } = await adminClient
      .from("client_profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (existingClient) {
      return new Response(JSON.stringify({ error: "A client with this email already exists." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers();
    const emailTaken = existingAuthUsers?.users?.some(
      (u: any) => u.email?.toLowerCase() === normalizedEmail,
    );
    if (emailTaken) {
      return new Response(JSON.stringify({ error: "This email is already registered. Use a different email for this client." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { contact_name, company_name, is_client: true },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client profile
    await adminClient.from("client_profiles").insert({
      user_id: newUser.user.id,
      customer_id,
      company_name,
      contact_name,
      email,
      phone: phone || null,
      tin_number: tin_number || null,
      warehouse_destinations: warehouse_destinations || [],
    });

    // Audit log
    await adminClient.from("audit_logs").insert({
      user_id: callerId,
      action: "create_client",
      resource_type: "client",
      resource_id: newUser.user.id,
      details: { client_email: email, company_name, customer_id },
    });

    return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
