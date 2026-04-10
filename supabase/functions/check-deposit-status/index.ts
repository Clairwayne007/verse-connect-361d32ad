import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const nowPaymentsApiKey = Deno.env.get("NOWPAYMENTS_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { deposit_id } = await req.json();

    if (!deposit_id) {
      return new Response(
        JSON.stringify({ error: "Missing deposit_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get deposit record
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", deposit_id)
      .single();

    if (depositError || !deposit) {
      return new Response(
        JSON.stringify({ error: "Deposit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If already confirmed or failed, just return current status
    if (deposit.status === "confirmed" || deposit.status === "failed" || deposit.status === "expired") {
      return new Response(
        JSON.stringify({ deposit }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check status with NOWPayments if payment_id exists
    if (deposit.payment_id && nowPaymentsApiKey) {
      const statusResponse = await fetch(
        `https://api.nowpayments.io/v1/payment/${deposit.payment_id}`,
        {
          headers: { "x-api-key": nowPaymentsApiKey },
        }
      );

      if (statusResponse.ok) {
        const paymentData = await statusResponse.json();
        
        let status: "waiting" | "confirming" | "confirmed" | "failed" | "expired" = deposit.status;
        switch (paymentData.payment_status) {
          case "waiting":
            status = "waiting";
            break;
          case "confirming":
            status = "confirming";
            break;
          case "confirmed":
          case "finished":
            status = "confirmed";
            break;
          case "failed":
          case "refunded":
            status = "failed";
            break;
          case "expired":
            status = "expired";
            break;
        }

        if (status !== deposit.status) {
          const { data: updatedDeposit } = await supabase
            .from("deposits")
            .update({
              status: status,
              crypto_amount: paymentData.actually_paid || paymentData.pay_amount,
            })
            .eq("id", deposit_id)
            .select()
            .single();

          return new Response(
            JSON.stringify({ deposit: updatedDeposit || deposit }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ deposit }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
