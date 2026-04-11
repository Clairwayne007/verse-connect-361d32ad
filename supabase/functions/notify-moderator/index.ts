import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transaction_type, amount, user_email, transaction_id } = await req.json();

    // Find all moderators
    const { data: modRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "moderator");

    if (!modRoles || modRoles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No moderators to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modUserIds = modRoles.map((r) => r.user_id);

    // Get moderator emails
    const { data: modProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", modUserIds);

    // Send email to each moderator via Resend gateway
    if (modProfiles && modProfiles.length > 0 && resendApiKey && lovableApiKey) {
      for (const mod of modProfiles) {
        try {
          await fetch(`${GATEWAY_URL}/emails`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": resendApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Iamverse <noreply@iamversetrade.com>",
              to: [mod.email],
              subject: `Transaction Alert: ${transaction_type} Confirmed - $${amount}`,
              html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;">
<div style="text-align:center;margin-bottom:24px;"><img src="https://iamversetrade.com/iamverse-logo.png" alt="Iamverse" style="height:48px;" /></div>
<h2 style="color:#0ea5e9;">Transaction Notification</h2>
<p>Namaste! A transaction has been confirmed:</p>
<div style="background:#f4f4f5;padding:16px;border-radius:8px;margin:16px 0;">
<p><strong>Type:</strong> ${transaction_type}</p>
<p><strong>Amount:</strong> $${amount}</p>
<p><strong>User:</strong> ${user_email}</p>
<p><strong>Transaction ID:</strong> ${transaction_id}</p>
<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
</div>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
<p style="color:#999;font-size:12px;text-align:center;">© 2022 Iamverse Trading | <a href="https://iamversetrade.com" style="color:#0ea5e9;">iamversetrade.com</a></p>
</div>`,
            }),
          });
        } catch (emailErr) {
          console.error(`Failed to email moderator ${mod.email}:`, emailErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
