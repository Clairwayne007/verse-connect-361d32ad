import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    if (!nowPaymentsApiKey) {
      throw new Error("NOWPayments API key not configured");
    }

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

    const userId = claimsData.user.id;
    const { amount_usd, crypto_currency } = await req.json();

    if (!amount_usd || amount_usd <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create NOWPayments invoice
    const invoiceResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": nowPaymentsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount_usd,
        price_currency: "usd",
        pay_currency: crypto_currency || "btc",
        order_id: `deposit-${userId}-${Date.now()}`,
        order_description: `IAMVERSE Deposit - $${amount_usd} USD`,
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
        success_url: "https://iamversetrade.com/dashboard/wallet?status=success",
        cancel_url: "https://iamversetrade.com/dashboard/wallet?status=cancelled",
      }),
    });

    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error("NOWPayments error:", errorText);
      throw new Error(`NOWPayments API error: ${invoiceResponse.status}`);
    }

    const invoice = await invoiceResponse.json();

    // Create deposit record
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: userId,
        amount_usd: amount_usd,
        crypto_currency: crypto_currency || "btc",
        invoice_id: invoice.id,
        invoice_url: invoice.invoice_url,
        status: "waiting",
      })
      .select()
      .single();

    if (depositError) {
      console.error("Deposit insert error:", depositError);
      throw new Error("Failed to create deposit record");
    }

    return new Response(
      JSON.stringify({
        success: true,
        deposit: deposit,
        invoice_url: invoice.invoice_url,
        invoice_id: invoice.id,
      }),
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
