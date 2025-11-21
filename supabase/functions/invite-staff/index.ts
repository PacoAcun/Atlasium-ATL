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

    // Usar Service Role Key para poder buscar usuarios por email (admin level)
    // OJO: Normalmente no exponemos esto, pero para buscar ID por email necesitamos privilegios
    // Una alternativa es que el usuario busque por ID, pero por email es mejor UX.
    // Usaremos el cliente normal para verificar auth del request, y admin para buscar.
    
    const supabaseClient = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Invalid token');

    const { eventId, email } = await req.json();
    if (!eventId || !email) throw new Error('Event ID and Email are required');

    // 1. Verificar que quien invita es ADMIN del evento
    const { data: member, error: memberError } = await supabaseClient
      .from('event_members')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (memberError || member?.role !== 'admin') {
      throw new Error('Only admins can invite staff');
    }

    // 2. Buscar usuario invitado por email (usando admin client)
    // Nota: Supabase no permite buscar usuarios por email directamente desde client side fácilmente sin exponer datos.
    // Una estrategia común es tener una tabla 'profiles' pública o usar una función RPC.
    // Aquí intentaremos buscar en la tabla 'users' si existe (asumiendo que tenemos una tabla users pública sincronizada con auth.users)
    
    const { data: invitedUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (findError || !invitedUser) {
      throw new Error('User not found with that email');
    }

    // 3. Insertar en event_members
    const { error: insertError } = await supabaseClient
      .from('event_members')
      .insert({
        event_id: eventId,
        user_id: invitedUser.id,
        role: 'staff'
      });

    if (insertError) {
      if (insertError.code === '23505') throw new Error('User is already a member');
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Staff added successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Invite Staff error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
