import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.13.0';
import { config } from '../_shared/config.ts';
import { decryptPrivateKey } from '../_shared/walletService.ts';

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

    const { toAddress, amount } = await req.json();
    if (!toAddress || !amount) throw new Error('Address and amount are required');

    // 1. Obtener wallet del usuario (sender)
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('address, encrypted_private_key')
      .eq('user_id', user.id)
      .single();

    if (walletError || !walletData) throw new Error('Wallet not found');

    // 2. Desencriptar llave privada
    const privateKey = await decryptPrivateKey(walletData.encrypted_private_key);

    // 3. Preparar provider y wallet
    const provider = new ethers.JsonRpcProvider(config.sepolia.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    // 4. Instanciar contrato ATL
    const abi = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)"
    ];
    const contract = new ethers.Contract(config.tokens.atlAddress, abi, signer);

    // 5. Ejecutar transferencia
    const amountWei = ethers.parseEther(amount.toString());
    
    // Verificar gas (el usuario necesita ETH para gas)
    // En un sistema custodial real, el backend podría pagar el gas (meta-tx) o verificar balance ETH.
    // Por simplicidad, asumimos que el usuario tiene ETH (del registro inicial o topup de gas).
    
    const tx = await contract.transfer(toAddress, amountWei);
    await tx.wait();

    // 6. Registrar transacción en DB
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        tx_hash: tx.hash,
        amount: amount,
        tx_type: 'transfer', // 'transfer' para pagos P2P/Eventos
        status: 'completed',
        from_address: walletData.address,
        to_address: toAddress
      });

    if (txError) console.error('Error logging transaction:', txError);

    return new Response(
      JSON.stringify({ success: true, txHash: tx.hash }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Transfer error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
