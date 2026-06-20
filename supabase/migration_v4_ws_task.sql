-- Migration v4: WS Task API rebrand + balance system + lifetime fields
-- Run on existing databases

DO $$ BEGIN
  CREATE TYPE history_record_type AS ENUM ('daily', 'income_add');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rename columns
ALTER TABLE public.users RENAME COLUMN api_information TO api_key;
ALTER TABLE public.users RENAME COLUMN total_balance TO balance;
ALTER TABLE public.users RENAME COLUMN total_registration TO lifetime_registration;
ALTER TABLE public.users RENAME COLUMN total_valid_users TO lifetime_valid_users;
ALTER TABLE public.users RENAME COLUMN total_sms_sent TO lifetime_sms_sent;
ALTER TABLE public.users RENAME COLUMN total_income TO lifetime_income;

-- History extensions
ALTER TABLE public.history ADD COLUMN IF NOT EXISTS record_type history_record_type NOT NULL DEFAULT 'daily';
ALTER TABLE public.history ADD COLUMN IF NOT EXISTS added_income DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.history ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12, 2);

ALTER TABLE public.history DROP CONSTRAINT IF EXISTS history_user_id_record_date_key;

CREATE UNIQUE INDEX IF NOT EXISTS history_daily_unique
  ON public.history (user_id, record_date)
  WHERE record_type = 'daily';

-- Minimum withdraw $10
ALTER TABLE public.withdraw_requests DROP CONSTRAINT IF EXISTS withdraw_requests_amount_check;
ALTER TABLE public.withdraw_requests ADD CONSTRAINT withdraw_requests_amount_check CHECK (amount >= 10);
