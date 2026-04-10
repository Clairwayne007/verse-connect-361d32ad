
-- Create the credit_user_balance function needed by process-daily-roi
CREATE OR REPLACE FUNCTION public.credit_user_balance(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET balance = COALESCE(balance, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;
