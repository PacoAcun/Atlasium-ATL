import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

    const { eventId, name, amount } = await req.json();

    if (!eventId || !name || !amount) throw new Error('Missing required fields');

    // 1. Verificar membresía (solo admin o staff pueden crear QRs?)
    // Asumimos que staff también puede crear QRs de cobro rápido
    const { data: member, error: memberError } = await supabase
      .from('event_members')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) throw new Error('Access denied');

    // 2. Insertar QR estático
    const { data: qr, error: qrError } = await supabase
      .from('static_qrs')
      .insert({
        event_id: eventId,
        name,
        amount
      })
      .select()
      .single();

    if (qrError) throw qrError;

    return new Response(
      JSON.stringify({ success: true, qr }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Create Static QR error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
