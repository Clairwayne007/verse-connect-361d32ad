-- Add 'paused' to investment_status enum
ALTER TYPE public.investment_status ADD VALUE IF NOT EXISTS 'paused';

-- Allow admins/moderators to update investments (for pausing)
CREATE POLICY "Admins can update all investments"
ON public.investments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Allow admins/moderators to delete profiles (for user deletion)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));