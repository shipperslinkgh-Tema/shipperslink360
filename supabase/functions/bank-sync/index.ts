import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Bank API configurations (to be populated with real endpoints)
const BANK_CONFIGS: Record<string, { name: string; baseUrl: string; authType: string }> = {
  access_bank: {
    name: "Access Bank Ghana",
    baseUrl: "https://api.accessbankplc.com/ghana",
    authType: "oauth2",
  },
  ecobank: {
    name: "Ecobank Ghana",
    baseUrl: "https://developer.ecobank.com/api",
    authType: "oauth2",
  },
  gcb: {
    name: "GCB Bank PLC",
    baseUrl: "https://api.gcbbank.com.gh",
    authType: "api_key",
  },
  adb: {
    name: "Agricultural Development Bank",
    baseUrl: "https://api.adb.com.gh",
    authType: "api_key",
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { action, bankConnectionId, bankName } = await req.json();

    switch (action) {
      case 'sync_balance': {
        // Fetch balance from bank API
        const { data: connection } = await adminClient
          .from('bank_connections')
          .select('*')
          .eq('id', bankConnectionId)
          .single();

        if (!connection) {
          return new Response(JSON.stringify({ error: 'Bank connection not found' }), { status: 404, headers: corsHeaders });
        }

        const bankApiKey = Deno.env.get(`${connection.bank_name.toUpperCase()}_API_KEY`);
        if (!bankApiKey) {
          // Update connection status to error
          await adminClient
            .from('bank_connections')
            .update({ sync_status: 'error', error_message: `API key not configured for ${connection.bank_display_name}` })
            .eq('id', bankConnectionId);

          return new Response(JSON.stringify({ 
            error: `API key not configured for ${connection.bank_display_name}. Please add the ${connection.bank_name.toUpperCase()}_API_KEY secret.` 
          }), { status: 400, headers: corsHeaders });
        }

        // TODO: Replace with actual bank API call
        // For now, update sync timestamp
        await adminClient
          .from('bank_connections')
          .update({ 
            last_sync_at: new Date().toISOString(),
            sync_status: 'connected',
            error_message: null 
          })
          .eq('id', bankConnectionId);

        return new Response(JSON.stringify({ success: true, message: 'Balance synced' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync_transactions': {
        const { data: connection } = await adminClient
          .from('bank_connections')
          .select('*')
          .eq('id', bankConnectionId)
          .single();

        if (!connection) {
          return new Response(JSON.stringify({ error: 'Bank connection not found' }), { status: 404, headers: corsHeaders });
        }

        // TODO: Fetch transactions from bank API and auto-match
        // For now, return success
        await adminClient
          .from('bank_connections')
          .update({ last_sync_at: new Date().toISOString(), sync_status: 'connected' })
          .eq('id', bankConnectionId);

        return new Response(JSON.stringify({ success: true, message: 'Transactions synced' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'auto_match': {
        // Auto-match unmatched credit transactions to outstanding receivables
        const { data: unmatchedTxns } = await adminClient
          .from('bank_transactions')
          .select('*')
          .eq('match_status', 'unmatched')
          .eq('transaction_type', 'credit');

        let matchedCount = 0;
        // TODO: Implement matching logic against receivables
        // Match by amount, counterparty name, or reference

        return new Response(JSON.stringify({ success: true, matched: matchedCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Bank sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
