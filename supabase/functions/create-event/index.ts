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

  // Validate config
  if (!config.supabase.serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server config error: Missing Service Role Key' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
  if (!config.encryption.secret) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server config error: Missing Encryption Secret' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    // 1. Verificar usuario con token (Cliente Anon)
    const supabaseAuth = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) throw new Error('Invalid token');

    const { name, description } = await req.json();

    if (!name) throw new Error('Event name is required');

    // 2. Cliente Admin para base de datos (Bypass RLS)
    const supabaseAdmin = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );

    // 3. Crear nueva wallet para el evento
    const wallet = await createWallet();
    const encryptedKey = await encryptPrivateKey(wallet.privateKey);

    // 4. Insertar evento en DB usando Service Role
    const { data: event, error: eventError } = await supabaseAdmin
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

    // 5. Agregar creador como admin del evento usando Service Role
    const { error: memberError } = await supabaseAdmin
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
    // Return 200 with error details so client can read it
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
