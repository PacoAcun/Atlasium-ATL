// Configuración compartida para todas las Edge Functions
export const config = {
  sepolia: {
    rpcUrl: Deno.env.get("SEPOLIA_RPC_URL") || "",
    atlTokenAddress: "0x917Ab07cDE116ED5b77b25D6643313284a4f899b",
  },
  encryption: {
    secret: Deno.env.get("ENCRYPTION_SECRET") || "",
  },
  funding: {
    privateKey: Deno.env.get("FUNDING_WALLET_PRIVATE_KEY") || "",
  },
  supabase: {
    url: Deno.env.get("SUPABASE_URL") || "",
    serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    anonKey: Deno.env.get("SUPABASE_ANON_KEY") || "",
  },
};
