import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailChangeRequest {
  email: string;
  newEmail: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const { email, newEmail, name }: EmailChangeRequest = await req.json();
    if (!email || !newEmail) throw new Error("Missing required fields: email and newEmail");

    const userName = name || "there";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: template } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_key", "email_changed")
      .single();

    const subject = template?.subject || "Email Address Changed - Iamverse";
    let htmlContent = template?.html_content || `<p>Hi ${userName},</p><p>Your Iamverse email has been changed to <strong>${newEmail}</strong>.</p><p>If you didn't make this change, please contact support immediately.</p>`;

    htmlContent = htmlContent.replace(/\{\{name\}\}/g, userName);
    htmlContent = htmlContent.replace(/\{\{newEmail\}\}/g, newEmail);

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

    console.log("Email change notification sent successfully:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-email-change-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
