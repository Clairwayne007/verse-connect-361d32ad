import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transaction_type, amount, user_email, transaction_id } = await req.json();

    // Find all moderators
    const { data: modRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "moderator");

    if (!modRoles || modRoles.length === 0) {
      console.log("No moderators found to notify");
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

    // Insert in-app notifications for each moderator
    const notifications = modUserIds.map((userId) => ({
      user_id: userId,
      title: `${transaction_type} Confirmed`,
      message: `A ${transaction_type.toLowerCase()} of $${amount} by ${user_email} has been confirmed. (ID: ${transaction_id?.slice(0, 8)})`,
    }));

    // Use service role to insert notifications directly
    await supabase.from("notifications").insert(notifications);

    // Send email to each moderator
    if (modProfiles && modProfiles.length > 0) {
      for (const mod of modProfiles) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "IAMVERSE <noreply@iamversetrade.com>",
              to: [mod.email],
              subject: `Transaction Alert: ${transaction_type} Confirmed - $${amount}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #0ea5e9;">Transaction Notification</h2>
                  <p>A transaction has been successfully confirmed:</p>
                  <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Type:</strong> ${transaction_type}</p>
                    <p><strong>Amount:</strong> $${amount}</p>
                    <p><strong>User:</strong> ${user_email}</p>
                    <p><strong>Transaction ID:</strong> ${transaction_id}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  <p style="color: #71717a; font-size: 12px;">This is an automated notification from IAMVERSE Trading.</p>
                </div>
              `,
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
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
