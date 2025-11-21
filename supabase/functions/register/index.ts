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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validate environment variables first
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      console.error('Missing Supabase config:', { url: !!config.supabase.url, serviceRoleKey: !!config.supabase.serviceRoleKey });
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing Supabase credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!config.sepolia.rpcUrl) {
      console.error('Missing SEPOLIA_RPC_URL');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing Sepolia RPC URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!config.encryption.secret) {
      console.error('Missing ENCRYPTION_SECRET');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing encryption secret' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!config.funding.privateKey) {
      console.error('Missing FUNDING_WALLET_PRIVATE_KEY');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing funding wallet key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Parse request body
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      throw new Error('Missing required fields: name, email, password');
    }

    // 2. Crear cliente de Supabase con service role
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email (cambiar a false en producción)
      user_metadata: { name },
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Error creating user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // 4. Generar wallet Ethereum
    console.log('Generating Ethereum wallet...');
    const wallet = await createWallet();

    // 5. Encriptar private key
    console.log('Encrypting private key...');
    const encryptedKey = await encryptPrivateKey(wallet.privateKey);

    // 6. Guardar en tabla users
    console.log('Saving user to database...');
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      email,
      wallet_address: wallet.address,
      encrypted_private_key: encryptedKey,
      role: 'student',
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Rollback: eliminar usuario de Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Error saving user data: ${dbError.message}`);
    }

    // 7. Financiar wallet con gas (0.002 ETH) - esto puede fallar sin romper el registro
    let gasTransactionHash = '';
    try {
      console.log('Funding wallet with gas...');
      gasTransactionHash = await fundWalletWithGas(wallet.address);
      console.log('Gas funding successful:', gasTransactionHash);
    } catch (gasError) {
      console.error('Warning: Failed to fund wallet with gas:', gasError);
      // No lanzamos error, el usuario puede recibir gas después
    }

    // 8. Obtener balance inicial de ATL (debería ser 0)
    const atlBalance = await getATLBalance(wallet.address);

    // 9. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        email,
        name,
        walletAddress: wallet.address,
        atlBalance,
        gasTransactionHash: gasTransactionHash || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
