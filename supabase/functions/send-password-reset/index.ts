import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const { email, resetUrl }: PasswordResetRequest = await req.json();
    if (!email || !resetUrl) throw new Error("Missing required fields: email and resetUrl");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: template } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_key", "password_reset")
      .single();

    const subject = template?.subject || "Reset Your Password - Iamverse";
    let htmlContent = template?.html_content || `<p>Hi there,</p><p>Click <a href="${resetUrl}" style="color:#2563eb;text-decoration:underline;">here</a> to reset your password on Iamverse.</p><p>If you didn't request this, you can safely ignore this email.</p>`;

    htmlContent = htmlContent.replace(/\{\{resetUrl\}\}/g, resetUrl);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Iamverse <noreply@iamversetrade.com>",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data?.name === "validation_error") {
        console.log("Resend send blocked (likely unverified domain):", data);
        return new Response(
          JSON.stringify({ success: false, skipped: true, reason: "RESEND_VALIDATION_ERROR", data }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
      throw new Error(`Resend API error: ${JSON.stringify(data)}`);
    }

    console.log("Password reset email sent successfully:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-password-reset function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
