-- Migration v6: SMS, Income, and Withdraw history tables
-- Run on existing WS Task API databases

DO $$ BEGIN
  CREATE TYPE sms_history_status AS ENUM ('completed', 'pending', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.sms_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sms_sent INTEGER NOT NULL DEFAULT 0,
  income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status sms_history_status NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.income_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL DEFAULT '',
  sms_count INTEGER NOT NULL DEFAULT 0,
  amount_added DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.withdraw_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  withdraw_request_id UUID REFERENCES public.withdraw_requests(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  wallet_address TEXT NOT NULL,
  status withdraw_status NOT NULL DEFAULT 'pending',
  admin_response TEXT DEFAULT '',
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_history_user ON public.sms_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_income_history_user ON public.income_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_history_user ON public.withdraw_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_history_request ON public.withdraw_history(withdraw_request_id);

ALTER TABLE public.sms_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own sms history" ON public.sms_history;
CREATE POLICY "Users read own sms history"
  ON public.sms_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage sms history" ON public.sms_history;
CREATE POLICY "Admins manage sms history"
  ON public.sms_history FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users read own income history" ON public.income_history;
CREATE POLICY "Users read own income history"
  ON public.income_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage income history" ON public.income_history;
CREATE POLICY "Admins manage income history"
  ON public.income_history FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users read own withdraw history" ON public.withdraw_history;
CREATE POLICY "Users read own withdraw history"
  ON public.withdraw_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage withdraw history" ON public.withdraw_history;
CREATE POLICY "Admins manage withdraw history"
  ON public.withdraw_history FOR ALL
  USING (public.is_admin());

-- Backfill withdraw history from existing requests
INSERT INTO public.withdraw_history (
  user_id,
  withdraw_request_id,
  amount,
  wallet_address,
  status,
  admin_response,
  created_at,
  updated_at
)
SELECT
  wr.user_id,
  wr.id,
  wr.amount,
  wr.usdt_address,
  wr.status,
  COALESCE(wr.admin_note, ''),
  wr.created_at,
  COALESCE(wr.processed_at, wr.updated_at)
FROM public.withdraw_requests wr
WHERE NOT EXISTS (
  SELECT 1 FROM public.withdraw_history wh WHERE wh.withdraw_request_id = wr.id
);
