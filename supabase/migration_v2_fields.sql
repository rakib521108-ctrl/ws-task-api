-- Migration: rename stats fields to total_* / today_* and add status, last_update_time
-- Run ONLY if you already applied the old schema.sql

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_update_time TIMESTAMPTZ;

ALTER TABLE public.users RENAME COLUMN registration_count TO today_registration;
ALTER TABLE public.users RENAME COLUMN valid_users TO today_valid_users;
ALTER TABLE public.users RENAME COLUMN sms_sent TO today_sms_sent;
ALTER TABLE public.users RENAME COLUMN income TO today_income;
ALTER TABLE public.users RENAME COLUMN balance TO total_balance;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_registration INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_valid_users INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_sms_sent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_income DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Backfill totals from today values where totals are zero
UPDATE public.users SET
  total_registration = today_registration,
  total_valid_users = today_valid_users,
  total_sms_sent = today_sms_sent,
  total_income = today_income
WHERE total_registration = 0 AND total_valid_users = 0;

ALTER TABLE public.history RENAME COLUMN registration_count TO today_registration;
ALTER TABLE public.history RENAME COLUMN valid_users TO today_valid_users;
ALTER TABLE public.history RENAME COLUMN sms_sent TO today_sms_sent;
ALTER TABLE public.history RENAME COLUMN income TO today_income;

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
