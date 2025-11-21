# Supabase Edge Functions - Variables de Entorno

## Configuración en Supabase Dashboard

Ve a: Project Settings > Edge Functions > Environment variables

Agrega las siguientes variables:

### Ethereum Sepolia

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/W-kdHewyyg5rrk9RGYtqI
ATL_TOKEN_ADDRESS=0x917Ab07cDE116ED5b77b25D6643313284a4f899b
FUNDING_WALLET_PRIVATE_KEY=0984ed5f3f40a2a5e763fd03cc27f355afd43f46ac6b4b1619d42342281a338b
```

### Encryption

```
ENCRYPTION_SECRET=340c76eeaa1ec0e361512fa083b13dd8af89a67caa83a6cf18efd8d268bdca63
```

### Supabase (autogeneradas)

```
SUPABASE_URL=https://dihcozurxlofjewduily.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<obtener desde Dashboard>
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaGNvenVyeGxvZmpld2R1aWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTcyMzgsImV4cCI6MjA3OTE3MzIzOH0.K-h8vdhcXrlCVYohJqF0ofGN5TTfx55j_pNOamzY-dQ
```

## Para obtener SUPABASE_SERVICE_ROLE_KEY:

1. Ve a Project Settings > API
2. Copia la "service_role" key (NO la expongas públicamente)

## Seguridad

⚠️ NUNCA subas estas variables a Git
⚠️ La private key de funding wallet tiene acceso a fondos reales
⚠️ El encryption secret protege las private keys de los usuarios
