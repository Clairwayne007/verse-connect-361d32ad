import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { email, name } = await req.json();
    if (!email) throw new Error("Missing email");

    const userName = name || "there";

    const htmlContent = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://iamversetrade.com/iamverse-logo.png" alt="Iamverse" style="height:48px;" /></div>
<h1 style="color:#0ea5e9;font-size:22px;">Namaste, ${userName}!</h1>
<p style="color:#333;font-size:14px;line-height:1.6;">Your password has been changed successfully.</p>
<p style="color:#333;font-size:14px;line-height:1.6;">If you did not make this change, please contact support immediately.</p>
<div style="text-align:center;margin:24px 0;"><a href="https://iamversetrade.com/dashboard" style="background:#0ea5e9;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Go to Dashboard</a></div>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
<p style="color:#999;font-size:12px;text-align:center;">© 2022 Iamverse | <a href="https://iamversetrade.com" style="color:#0ea5e9;">iamversetrade.com</a></p>
</div>`;

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": resendApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Iamverse <noreply@iamversetrade.com>",
        to: [email],
        subject: "Password Changed - Iamverse",
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data?.name === "validation_error") {
        return new Response(
          JSON.stringify({ success: false, skipped: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      throw new Error(`Resend API error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
