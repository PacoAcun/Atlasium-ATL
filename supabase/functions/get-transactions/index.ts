import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getATLTransactions } from '../_shared/tokenService.ts';
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Invalid token');

    // Verificar si se solicita historial de un evento
    let targetAddress = null;
    const { eventId } = await req.json().catch(() => ({})); // Safe parse body

    if (eventId) {
      // 1. Verificar membresía
      const { data: member, error: memberError } = await supabase
        .from('event_members')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) throw new Error('Access denied to event history');

      // 2. Obtener wallet del evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('wallet_address')
        .eq('id', eventId)
        .single();

      if (eventError || !event) throw new Error('Event not found');
      targetAddress = event.wallet_address;
    
    } else {
      // Obtener wallet del usuario (personal)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.wallet_address) {
        throw new Error('User wallet not found');
      }
      targetAddress = userData.wallet_address;
    }

    console.log(`Fetching transactions for ${targetAddress}`);

    // Obtener transacciones desde Alchemy
    const transactions = await getATLTransactions(targetAddress);

    return new Response(
      JSON.stringify({ success: true, transactions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('History error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
