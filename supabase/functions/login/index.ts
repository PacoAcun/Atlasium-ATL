import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { config } from '../_shared/config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error('Missing required fields: email, password');
    }

    // 2. Crear cliente de Supabase
    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );

    // 3. Autenticar usuario
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    // 4. Obtener información de wallet del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, wallet_address, role')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    // 5. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userData?.name || '',
          walletAddress: userData?.wallet_address || '',
          role: userData?.role || 'student',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Invalid credentials',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      }
    );
  }
});
