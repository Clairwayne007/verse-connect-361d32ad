
-- Add missing columns to investments
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS amount_usd NUMERIC;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS roi_percent NUMERIC DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS earned_amount NUMERIC DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS plan_id TEXT;

-- Copy amount to amount_usd for existing rows
UPDATE public.investments SET amount_usd = amount WHERE amount_usd IS NULL;

-- Add reviewed column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT false;

-- Add template_key and description to email_templates
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS template_key TEXT;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS description TEXT;

-- Set template_key from name for existing rows
UPDATE public.email_templates SET template_key = name WHERE template_key IS NULL;
