
-- 1. Enable leaked password protection (security)
-- This is handled via auth config, not SQL

-- 2. Create function to auto-expire deposits older than 24 hours
CREATE OR REPLACE FUNCTION public.expire_old_deposits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE deposits
  SET status = 'expired', updated_at = now()
  WHERE status IN ('waiting', 'confirming')
    AND created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- 3. Create a cron-like trigger using pg_cron is not available,
-- so we'll call this from an edge function instead.

-- 4. Add admin SELECT policies for deposits, withdrawals, and investments
-- so admins can see all users' data in admin panel
CREATE POLICY "Admins can view all deposits"
ON public.deposits
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update all deposits"
ON public.deposits
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can view all investments"
ON public.investments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update all withdrawals"
ON public.withdrawals
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 5. Add admin policy to delete avatar storage objects
CREATE POLICY "Admins can delete any avatar"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')));

-- 6. Add admin policy to view all avatars
CREATE POLICY "Admins can view all avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')));
