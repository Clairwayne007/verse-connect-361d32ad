import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: investments, error: fetchError } = await supabase
      .from("investments")
      .select("*")
      .eq("status", "active");

    if (fetchError) {
      throw new Error(`Failed to fetch investments: ${fetchError.message}`);
    }

    if (!investments || investments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active investments to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let completed = 0;

    for (const inv of investments) {
      const now = new Date();
      const startDate = new Date(inv.start_date);
      const endDate = inv.end_date ? new Date(inv.end_date) : null;
      const totalRoi = roundCurrency((Number(inv.amount_usd) * Number(inv.roi_percent)) / 100);
      const previousEarned = roundCurrency(Number(inv.earned_amount) || 0);

      if (endDate && now >= endDate) {
        const difference = roundCurrency(totalRoi - previousEarned);

        if (difference > 0) {
          const { error: creditError } = await supabase.rpc("credit_user_balance", {
            p_user_id: inv.user_id,
            p_amount: difference,
          });

          if (creditError) {
            console.error(`Failed to finalize balance for user ${inv.user_id}:`, creditError);
            continue;
          }
        }

        const { error: completeError } = await supabase
          .from("investments")
          .update({
            status: "completed",
            earned_amount: totalRoi,
            updated_at: now.toISOString(),
          })
          .eq("id", inv.id);

        if (completeError) {
          console.error(`Failed to complete investment ${inv.id}:`, completeError);
          continue;
        }

        completed++;
        continue;
      }

      const elapsedMs = now.getTime() - startDate.getTime();
      const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
      const effectiveDays = Math.min(elapsedDays, Number(inv.duration_days));
      const correctEarned = roundCurrency((totalRoi * effectiveDays) / Number(inv.duration_days));
      const difference = roundCurrency(correctEarned - previousEarned);

      if (difference <= 0) {
        continue;
      }

      const { error: updateInvError } = await supabase
        .from("investments")
        .update({
          earned_amount: correctEarned,
          updated_at: now.toISOString(),
        })
        .eq("id", inv.id);

      if (updateInvError) {
        console.error(`Failed to update investment ${inv.id}:`, updateInvError);
        continue;
      }

      const { error: creditError } = await supabase.rpc("credit_user_balance", {
        p_user_id: inv.user_id,
        p_amount: difference,
      });

      if (creditError) {
        console.error(`Failed to credit balance for user ${inv.user_id}:`, creditError);
        continue;
      }

      processed++;
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processed} investments, completed ${completed}`,
        processed,
        completed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing daily ROI:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
