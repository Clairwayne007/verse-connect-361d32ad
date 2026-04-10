
ALTER TABLE public.deposits
  ADD COLUMN IF NOT EXISTS balance_credited boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS crypto_amount numeric DEFAULT NULL;
