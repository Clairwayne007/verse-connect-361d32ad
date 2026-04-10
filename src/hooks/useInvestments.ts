import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount_usd: number;
  roi_percent: number;
  duration_days: number;
  start_date: string;
  end_date: string | null;
  earned_amount: number;
  status: "active" | "completed" | "cancelled" | "paused";
  created_at: string;
  updated_at: string;
}

export const useInvestments = () => {
  const { session, isReady } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestments = useCallback(async () => {
    if (!session?.user) {
      setInvestments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching investments:", error);
        setIsLoading(false);
        return;
      }

      setInvestments(data as Investment[]);
    } catch (err) {
      console.error("Error fetching investments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    // Don't fetch until auth is fully ready
    if (!isReady) return;

    if (!session?.user) {
      setInvestments([]);
      setIsLoading(false);
      return;
    }

    fetchInvestments();

    const channel = supabase
      .channel(`investments-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchInvestments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isReady, session?.user?.id, fetchInvestments]);

  const createInvestment = async (
    planId: string,
    planName: string,
    amountUsd: number,
    roiPercent: number,
    durationDays: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: "Failed to fetch profile" };
      }

      if (Number(profile.balance) < amountUsd) {
        return { success: false, error: "Insufficient balance" };
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const { data, error } = await supabase
        .from("investments")
        .insert({
          user_id: session.user.id,
          plan_id: planId,
          plan_name: planName,
          amount: amountUsd,
          amount_usd: amountUsd,
          roi_percent: roiPercent,
          duration_days: durationDays,
          daily_roi: roiPercent / durationDays,
          end_date: endDate.toISOString(),
          status: "active",
        } as any)
        .select()
        .single();

      if (error) {
        console.error("Error creating investment:", error);
        return { success: false, error: error.message };
      }

      if (data) {
        setInvestments((prev) => [data as Investment, ...prev]);
      }

      return { success: true };
    } catch (err) {
      console.error("Error creating investment:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const activeInvestments = investments.filter((inv) => inv.status === "active");
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + Number(inv.amount_usd), 0);
  const totalEarned = investments.reduce((sum, inv) => sum + Number(inv.earned_amount), 0);
  const totalActiveInvested = activeInvestments.reduce((sum, inv) => sum + Number(inv.amount_usd), 0);

  return {
    investments,
    activeInvestments,
    totalInvested,
    totalEarned,
    totalActiveInvested,
    isLoading,
    createInvestment,
    refetch: fetchInvestments,
  };
};
