
-- Add balance_credited flag to prevent double-crediting
ALTER TABLE public.deposits ADD COLUMN balance_credited boolean NOT NULL DEFAULT false;

-- Create an atomic function to credit user balance (prevents race conditions)
CREATE OR REPLACE FUNCTION public.credit_user_balance(p_user_id uuid, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET balance = COALESCE(balance, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;
