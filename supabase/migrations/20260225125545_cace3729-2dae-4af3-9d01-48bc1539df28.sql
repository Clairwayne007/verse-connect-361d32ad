
-- Add reviewed column to profiles (false = new/unreviewed)
ALTER TABLE public.profiles ADD COLUMN reviewed boolean DEFAULT false;

-- Allow admins and moderators to SELECT all profiles
CREATE POLICY "Admins and moderators can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Allow admins and moderators to UPDATE all profiles (for marking reviewed)
CREATE POLICY "Admins and moderators can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
