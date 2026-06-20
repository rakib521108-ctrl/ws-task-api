-- Rename balance column to total_balance (if v4 renamed it to balance)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'balance'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN balance TO total_balance;
  END IF;
END $$;
