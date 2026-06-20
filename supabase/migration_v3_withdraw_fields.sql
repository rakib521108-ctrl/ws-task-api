-- Migration: add withdraw_method, usdt_network, processed_at to withdraw_requests
-- Run ONLY if you already applied an older schema

DO $$ BEGIN
  CREATE TYPE withdraw_method AS ENUM ('usdt', 'bank', 'mobile_banking');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE usdt_network AS ENUM ('TRC20', 'ERC20', 'BEP20', 'Polygon', 'Arbitrum');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.withdraw_requests
  ADD COLUMN IF NOT EXISTS withdraw_method withdraw_method NOT NULL DEFAULT 'usdt';

ALTER TABLE public.withdraw_requests
  ADD COLUMN IF NOT EXISTS usdt_network usdt_network NOT NULL DEFAULT 'TRC20';

ALTER TABLE public.withdraw_requests
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Backfill processed_at for already completed requests
UPDATE public.withdraw_requests
SET processed_at = updated_at
WHERE status IN ('approved', 'rejected') AND processed_at IS NULL;
