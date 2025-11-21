import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { transferATL } from '../_shared/tokenService.ts';
import { config } from '../_shared/config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verificar Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Invalid token');

    // 2. Obtener datos del request
    const { amount } = await req.json();
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // 3. Obtener wallet del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.wallet_address) {
      throw new Error('User wallet not found');
    }

    console.log(`Topping up ${amount} ATL for user ${user.email} (${userData.wallet_address})`);

    // 4. Transferir ATL desde la Funding Wallet
    const txHash = await transferATL(
      config.funding.privateKey,
      userData.wallet_address,
      amount.toString()
    );

    // 5. Registrar transacción en base de datos
    const { error: txError } = await supabase.from('transactions').insert({
      from_user_id: null, // System/Funding wallet
      to_user_id: user.id,
      amount: amount,
      tx_type: 'transfer', // Changed from type: 'topup' to match schema constraint
      status: 'confirmed',
      tx_hash: txHash,
      metadata: { type: 'topup' }, // Store specific type in metadata
      description: `Recarga de saldo`
    });

    if (txError) console.error('Error logging transaction:', txError);

    return new Response(
      JSON.stringify({ success: true, txHash, message: `Recarga de ${amount} ATL exitosa` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Topup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
