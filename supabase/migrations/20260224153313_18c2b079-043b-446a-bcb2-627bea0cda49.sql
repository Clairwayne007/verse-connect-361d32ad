
-- Fix notifications INSERT policy to be more restrictive
-- Only service role and moderators/admins should insert
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

CREATE POLICY "Moderators and service can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
);
