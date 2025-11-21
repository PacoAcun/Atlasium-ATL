import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWallet, encryptPrivateKey, fundWalletWithGas } from '../_shared/walletService.ts';
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

    const { name, description } = await req.json();

    if (!name) throw new Error('Event name is required');

    // 1. Crear nueva wallet para el evento
    const wallet = await createWallet();
    const encryptedKey = await encryptPrivateKey(wallet.privateKey);

    // 2. Financiar wallet con gas (opcional, pero recomendado si va a hacer envíos)
    // Por ahora lo comentamos para ahorrar gas de prueba, o lo dejamos si es necesario
    // await fundWalletWithGas(wallet.address);

    // 3. Insertar evento en DB
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name,
        description,
        wallet_address: wallet.address,
        encrypted_private_key: encryptedKey,
        created_by: user.id
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // 4. Agregar creador como admin del evento
    const { error: memberError } = await supabase
      .from('event_members')
      .insert({
        event_id: event.id,
        user_id: user.id,
        role: 'admin'
      });

    if (memberError) throw memberError;

    return new Response(
      JSON.stringify({ success: true, event }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Create Event error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
