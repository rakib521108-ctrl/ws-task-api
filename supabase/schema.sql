-- WS Task API - Supabase Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE withdraw_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE withdraw_method AS ENUM ('usdt', 'bank', 'mobile_banking');
CREATE TYPE usdt_network AS ENUM ('TRC20', 'ERC20', 'BEP20', 'Polygon', 'Arbitrum');
CREATE TYPE history_record_type AS ENUM ('daily', 'income_add');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  api_key TEXT DEFAULT '',
  status user_status NOT NULL DEFAULT 'active',
  lifetime_registration INTEGER NOT NULL DEFAULT 0,
  lifetime_valid_users INTEGER NOT NULL DEFAULT 0,
  lifetime_sms_sent INTEGER NOT NULL DEFAULT 0,
  lifetime_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  today_registration INTEGER NOT NULL DEFAULT 0,
  today_valid_users INTEGER NOT NULL DEFAULT 0,
  today_sms_sent INTEGER NOT NULL DEFAULT 0,
  today_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  last_update_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type history_record_type NOT NULL DEFAULT 'daily',
  today_registration INTEGER NOT NULL DEFAULT 0,
  today_valid_users INTEGER NOT NULL DEFAULT 0,
  today_sms_sent INTEGER NOT NULL DEFAULT 0,
  today_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  added_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  balance_after DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX history_daily_unique
  ON public.history (user_id, record_date)
  WHERE record_type = 'daily';

CREATE TABLE public.withdraw_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  usdt_address TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 10),
  withdraw_method withdraw_method NOT NULL DEFAULT 'usdt',
  usdt_network usdt_network NOT NULL DEFAULT 'TRC20',
  status withdraw_status NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT '',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_history_user_date ON public.history(user_id, record_date DESC);
CREATE INDEX idx_history_type ON public.history(record_type);
CREATE INDEX idx_withdraw_user ON public.withdraw_requests(user_id);
CREATE INDEX idx_withdraw_status ON public.withdraw_requests(status);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER withdraw_requests_updated_at
  BEFORE UPDATE ON public.withdraw_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Users can read own history"
  ON public.history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage history"
  ON public.history FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can read own withdraws"
  ON public.withdraw_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create withdraw requests"
  ON public.withdraw_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update withdraws"
  ON public.withdraw_requests FOR UPDATE
  USING (public.is_admin());
