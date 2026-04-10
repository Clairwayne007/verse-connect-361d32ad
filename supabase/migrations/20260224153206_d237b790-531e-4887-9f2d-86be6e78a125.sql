
-- 1. Email templates: only moderators can update (not admin)
DROP POLICY IF EXISTS "Admins can update email templates" ON public.email_templates;
CREATE POLICY "Moderators can update email templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- 2. User roles: only moderators can insert/update/delete roles (not admin)
DROP POLICY IF EXISTS "Admins and moderators can insert roles" ON public.user_roles;
CREATE POLICY "Moderators can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins and moderators can update roles" ON public.user_roles;
CREATE POLICY "Moderators can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Moderators can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- 3. Add phone_number and phone_verified to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- 4. Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);
