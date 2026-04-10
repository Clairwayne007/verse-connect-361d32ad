-- Add service role policy for deposits (for webhook to update)
CREATE POLICY "Service role can update all deposits"
  ON public.deposits FOR UPDATE
  TO service_role
  USING (true);

-- Add service role policy for profiles (for webhook to credit balance)
CREATE POLICY "Service role can update all profiles"
  ON public.profiles FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all profiles"
  ON public.profiles FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all deposits"
  ON public.deposits FOR SELECT
  TO service_role
  USING (true);