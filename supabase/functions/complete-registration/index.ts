import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWallet, encryptPrivateKey, fundWalletWithGas } from '../_shared/walletService.ts';
import { getATLBalance } from '../_shared/tokenService.ts';
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
    // 1. Validate Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Invalid token');

    // 2. Check if user already has a profile
    // Use Admin client for DB operations to bypass RLS
    const supabaseAdmin = createClient(
      config.supabase.url,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ success: true, message: 'Profile already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3. Get metadata from Auth User (passed during signUp)
    console.log('User metadata:', user.user_metadata);
    const { name, carnet } = user.user_metadata;

    if (!name || !carnet) {
      console.error('Missing metadata:', { name, carnet });
      throw new Error('Missing user metadata (name or carnet)');
    }

    // 4. Generate Wallet
    console.log('Generating Ethereum wallet...');
    const wallet = await createWallet();
    const encryptedKey = await encryptPrivateKey(wallet.privateKey);

    // 5. Create Profile in DB
    console.log('Inserting user into DB:', { id: user.id, name, email: user.email, carnet });
    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: user.id,
      name,
      email: user.email,
      carnet,
      wallet_address: wallet.address,
      encrypted_private_key: encryptedKey,
      role: 'student',
    });

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      throw dbError;
    }

    // 6. Fund with Gas (Async)
    try {
      fundWalletWithGas(wallet.address);
    } catch (e) {
      console.error('Gas funding failed:', e);
    }

    return new Response(
      JSON.stringify({ success: true, walletAddress: wallet.address }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Complete registration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, details: error }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
