-- Migration v7: Align users table column names with total_* / today_* convention
-- Reverts v4 lifetime_* renames for cumulative stat columns

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lifetime_registration'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN lifetime_registration TO total_registration;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lifetime_valid_users'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN lifetime_valid_users TO total_valid_users;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lifetime_sms_sent'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN lifetime_sms_sent TO total_sms_sent;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lifetime_income'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN lifetime_income TO total_income;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'balance'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN balance TO total_balance;
  END IF;
END $$;
