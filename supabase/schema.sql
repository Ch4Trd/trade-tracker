-- ============================================================
-- TradingJournal Pro — Database Schema
-- Run this in: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================

-- Profiles (one per auth user)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT,
  timezone    TEXT NOT NULL DEFAULT 'America/New_York',
  onboarded   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prop firm accounts (user can have many)
CREATE TABLE IF NOT EXISTS prop_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  firm_name      TEXT NOT NULL,
  account_size   INTEGER NOT NULL,         -- in dollars: 5000, 10000, 25000...
  account_number TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trades (linked to a prop account)
CREATE TABLE IF NOT EXISTS trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prop_account_id UUID REFERENCES prop_accounts ON DELETE SET NULL,
  symbol          TEXT NOT NULL,
  direction       TEXT NOT NULL CHECK (direction IN ('long','short')),
  entry_price     NUMERIC NOT NULL,
  exit_price      NUMERIC,
  entry_time      TIMESTAMPTZ NOT NULL,
  exit_time       TIMESTAMPTZ,
  position_size   NUMERIC NOT NULL,
  pnl             NUMERIC,
  pnl_percent     NUMERIC,
  status          TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('open','closed','pending')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_details (
  trade_id              UUID PRIMARY KEY REFERENCES trades ON DELETE CASCADE,
  entry_reason          TEXT,
  exit_reason           TEXT,
  psychological_notes   TEXT,
  confidence_level      SMALLINT CHECK (confidence_level BETWEEN 1 AND 5),
  structure_quality     SMALLINT CHECK (structure_quality BETWEEN 1 AND 5),
  confluence_count      SMALLINT,
  ai_feedback           TEXT
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS prop_accounts_user_idx ON prop_accounts (user_id);
CREATE INDEX IF NOT EXISTS trades_user_idx         ON trades (user_id);
CREATE INDEX IF NOT EXISTS trades_account_idx      ON trades (prop_account_id);

-- ---- Row Level Security ----
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile"       ON profiles      FOR ALL USING (auth.uid() = id);
CREATE POLICY "own prop accounts" ON prop_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own trades"        ON trades        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own trade details" ON trade_details
  FOR ALL USING (EXISTS (SELECT 1 FROM trades WHERE trades.id = trade_details.trade_id AND trades.user_id = auth.uid()));

-- ---- Auto-create profile on signup ----
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---- Updated_at trigger ----
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
