import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function hmacSha512(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key: string) => {
      result[key] =
        obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])
          ? sortObject(obj[key] as Record<string, unknown>)
          : obj[key];
      return result;
    }, {});
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ipnSecret = Deno.env.get("NOWPAYMENTS_IPN_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const payload = JSON.parse(body);
    console.log("NOWPayments webhook received:", body);

    // Verify HMAC signature if IPN secret is configured
    if (ipnSecret) {
      const receivedSig = req.headers.get("x-nowpayments-sig");
      if (!receivedSig) {
        console.error("Missing x-nowpayments-sig header");
        return new Response(
          JSON.stringify({ error: "Missing signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sorted = sortObject(payload);
      const expectedSig = await hmacSha512(ipnSecret, JSON.stringify(sorted));

      if (receivedSig !== expectedSig) {
        console.error("Signature mismatch. Expected:", expectedSig, "Received:", receivedSig);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Signature verified successfully");
    } else {
      console.warn("No IPN secret configured, skipping signature verification");
    }

    const {
      payment_id,
      invoice_id,
      payment_status,
      pay_amount,
      actually_paid,
    } = payload;

    if (!invoice_id) {
      console.log("No invoice_id in payload");
      return new Response(
        JSON.stringify({ success: true, message: "No invoice_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map NOWPayments status to our status
    let status: "waiting" | "confirming" | "confirmed" | "failed" | "expired";
    switch (payment_status) {
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
      default:
        status = "waiting";
    }

    // Update deposit record
    const { data: deposit, error: updateError } = await supabase
      .from("deposits")
      .update({
        payment_id: payment_id?.toString(),
        status: status,
        crypto_amount: actually_paid || pay_amount,
      })
      .eq("invoice_id", invoice_id.toString())
      .select()
      .single();

    if (updateError) {
      console.error("Error updating deposit:", updateError);
      throw updateError;
    }

    console.log(`Deposit ${deposit.id} updated to status: ${status}`);

    // If payment confirmed and not already credited, credit user balance
    if (status === "confirmed" && deposit && !deposit.balance_credited) {
      const { error: creditError } = await supabase.rpc("credit_user_balance", {
        p_user_id: deposit.user_id,
        p_amount: deposit.amount_usd,
      });

      if (creditError) {
        console.error("Error crediting balance:", creditError);
      } else {
        await supabase
          .from("deposits")
          .update({ balance_credited: true })
          .eq("id", deposit.id);
        console.log(`Balance credited for deposit ${deposit.id}: $${deposit.amount_usd}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
