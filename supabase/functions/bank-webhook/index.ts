import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-bank-name',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    const bankName = req.headers.get('x-bank-name') || 'unknown';
    
    const expectedSecret = Deno.env.get('BANK_WEBHOOK_SECRET');
    if (expectedSecret && webhookSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), { status: 403, headers: corsHeaders });
    }

    const payload = await req.json();
    const { event_type, data } = payload;

    // Find bank connection
    const { data: connection } = await adminClient
      .from('bank_connections')
      .select('id')
      .eq('bank_name', bankName)
      .eq('is_active', true)
      .single();

    if (!connection) {
      return new Response(JSON.stringify({ error: 'Bank connection not found' }), { status: 404, headers: corsHeaders });
    }

    switch (event_type) {
      case 'transaction.credit':
      case 'transaction.debit': {
        // Insert transaction
        const { data: txn, error: txnError } = await adminClient
          .from('bank_transactions')
          .insert({
            bank_connection_id: connection.id,
            transaction_ref: data.reference || `TXN-${Date.now()}`,
            transaction_type: event_type === 'transaction.credit' ? 'credit' : 'debit',
            amount: data.amount,
            currency: data.currency || 'GHS',
            balance_after: data.balance_after,
            description: data.description || data.narration,
            counterparty_name: data.counterparty_name,
            counterparty_account: data.counterparty_account,
            transaction_date: data.transaction_date || new Date().toISOString(),
            value_date: data.value_date,
            raw_data: data,
          })
          .select()
          .single();

        if (txnError) throw txnError;

        // Create alert
        const alertType = event_type === 'transaction.credit' ? 'credit_received' : 'debit_processed';
        const priority = data.amount > 50000 ? 'high' : data.amount > 10000 ? 'medium' : 'low';

        await adminClient.from('bank_alerts').insert({
          bank_connection_id: connection.id,
          transaction_id: txn.id,
          alert_type: alertType,
          title: `${event_type === 'transaction.credit' ? 'Credit' : 'Debit'}: GHS ${Number(data.amount).toLocaleString()}`,
          message: `${data.description || 'Transaction'} from ${data.counterparty_name || 'Unknown'}`,
          amount: data.amount,
          currency: data.currency || 'GHS',
          priority,
        });

        // Update balance on connection
        if (data.balance_after !== undefined) {
          await adminClient
            .from('bank_connections')
            .update({ balance: data.balance_after, last_sync_at: new Date().toISOString() })
            .eq('id', connection.id);
        }

        break;
      }

      case 'balance.update': {
        await adminClient
          .from('bank_connections')
          .update({ 
            balance: data.balance, 
            available_balance: data.available_balance,
            last_sync_at: new Date().toISOString() 
          })
          .eq('id', connection.id);

        // Low balance alert
        if (data.available_balance < (data.low_balance_threshold || 10000)) {
          await adminClient.from('bank_alerts').insert({
            bank_connection_id: connection.id,
            alert_type: 'low_balance',
            title: `Low Balance Alert: GHS ${Number(data.available_balance).toLocaleString()}`,
            message: `Available balance is below threshold on ${bankName} account`,
            amount: data.available_balance,
            priority: 'high',
          });
        }
        break;
      }

      case 'transaction.failed': {
        await adminClient.from('bank_alerts').insert({
          bank_connection_id: connection.id,
          alert_type: 'failed_transaction',
          title: `Failed Transaction: GHS ${Number(data.amount).toLocaleString()}`,
          message: data.reason || 'Transaction failed',
          amount: data.amount,
          priority: 'high',
        });
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Bank webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
