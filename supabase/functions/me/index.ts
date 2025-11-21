import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getATLBalance } from '../_shared/tokenService.ts';
import { getETHBalance } from '../_shared/walletService.ts';
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
    // 1. Obtener token del header Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Crear cliente de Supabase
    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // 3. Verificar token y obtener usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    // 4. Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, wallet_address, role')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // 5. Obtener balances de ATL y ETH
    const [atlBalance, ethBalance] = await Promise.all([
      getATLBalance(userData.wallet_address),
      getETHBalance(userData.wallet_address),
    ]);

    // 6. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        id: user.id,
        email: user.email,
        name: userData.name,
        walletAddress: userData.wallet_address,
        role: userData.role,
        balances: {
          atl: atlBalance,
          eth: ethBalance,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Profile error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        stack: error.stack, // Optional: include stack trace for debugging
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Changed from 401 to 400 to differentiate from auth failure if it's a logic error
      }
    );
  }
});
