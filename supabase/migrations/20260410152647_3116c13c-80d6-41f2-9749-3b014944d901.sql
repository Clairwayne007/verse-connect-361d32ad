
CREATE OR REPLACE FUNCTION public.debit_user_balance(p_user_id uuid, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance numeric;
BEGIN
  SELECT balance INTO current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles
  SET balance = balance - p_amount, updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;
