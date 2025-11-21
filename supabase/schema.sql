-- Atlasium Database Schema
-- Ejecutar en Supabase SQL Editor

-- Tabla: users (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'merchant', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: wallets (opcional, para tracking de recarga de gas)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT UNIQUE NOT NULL,
  last_gas_refill TIMESTAMPTZ,
  gas_refill_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: transactions (historial de transacciones)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.users(id),
  to_user_id UUID REFERENCES public.users(id),
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  tx_type TEXT DEFAULT 'transfer' CHECK (tx_type IN ('transfer', 'purchase', 'refund')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet ON public.transactions(from_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet ON public.transactions(to_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS para wallets
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (user_id = auth.uid());

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (from_user_id = auth.uid());

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios de tabla
COMMENT ON TABLE public.users IS 'Usuarios registrados con sus wallets Ethereum';
COMMENT ON TABLE public.wallets IS 'Información de wallets para tracking de gas';
COMMENT ON TABLE public.transactions IS 'Historial de transacciones de ATL tokens';

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.wallets TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
