
-- Create email_templates table
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view
CREATE POLICY "Admins can view email templates"
ON public.email_templates FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admins can update
CREATE POLICY "Admins can update email templates"
ON public.email_templates FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can read (for edge functions)
CREATE POLICY "Service role can read email templates"
ON public.email_templates FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with current email templates
INSERT INTO public.email_templates (template_key, subject, description, html_content) VALUES
('welcome', 'Welcome to Iamverse! 🎉', 'Sent to new users after registration', '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0;">Welcome to Iamverse!</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2 style="color: #333;">Namaste {{name}}! 👋</h2><p>Congratulations! Your account has been successfully created on Iamverse.</p><p>You''re now part of our investment community. Here''s what you can do:</p><ul style="color: #555;"><li>Explore our investment plans</li><li>Track your portfolio performance</li><li>Make secure deposits and withdrawals</li><li>Access real-time market data</li></ul><div style="text-align: center; margin: 30px 0;"><a href="https://iamversetrading.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a></div><p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p style="color: #999; font-size: 12px; text-align: center;">© 2022 Iamverse. All rights reserved.</p></div></body></html>'),

('password_reset', 'Reset Your Password - Iamverse', 'Sent when user requests a password reset', '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0;">IAMverse</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2 style="color: #333;">Password Reset Request</h2><p>You requested to reset your password. Click the button below to set a new password:</p><div style="text-align: center; margin: 30px 0;"><a href="{{resetUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a></div><p style="color: #666; font-size: 14px;">If you didn''t request this, you can safely ignore this email.</p><p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p style="color: #999; font-size: 12px; text-align: center;">© 2022 Iamverse. All rights reserved.</p></div></body></html>'),

('password_changed', 'Password Changed - Iamverse', 'Sent after password is changed', '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0;">Iamverse</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2 style="color: #333;">Namaste {{name}},</h2><p>Your password has been successfully changed.</p><p>If you did not make this change, please contact our support team immediately or reset your password.</p><div style="text-align: center; margin: 30px 0;"><a href="https://iamversetrading.com/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Login</a></div><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p style="color: #999; font-size: 12px; text-align: center;">© 2022 Iamverse. All rights reserved.</p></div></body></html>'),

('email_changed', 'Email Address Changed - Iamverse', 'Sent when user changes their email', '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0;">iamverse</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2 style="color: #333;">Namaste {{name}},</h2><p>Your email address has been changed to <strong>{{newEmail}}</strong>.</p><p>If you did not make this change, please contact our support team immediately.</p><div style="text-align: center; margin: 30px 0;"><a href="https://iamversetrading.com/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Login</a></div><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p style="color: #999; font-size: 12px; text-align: center;">© 2022 Iamverse. All rights reserved.</p></div></body></html>');
