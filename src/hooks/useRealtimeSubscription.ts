import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TableName = "profiles" | "deposits" | "withdrawals" | "investments" | "notifications";

interface RealtimeConfig {
  table: TableName;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  alertOnInsert?: string; // toast title for new inserts
}

export const useRealtimeSubscription = (
  configs: RealtimeConfig[],
  onRefresh: () => void
) => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel("admin-realtime-" + Date.now());

    configs.forEach((config) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: config.table },
        (payload: any) => {
          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            if (config.alertOnInsert) {
              toast({
                title: config.alertOnInsert,
                description: `New ${config.table.slice(0, -1)} detected. Dashboard updated.`,
              });
            }
            config.onInsert?.(payload);
          } else if (eventType === "UPDATE") {
            config.onUpdate?.(payload);
          } else if (eventType === "DELETE") {
            config.onDelete?.(payload);
          }

          // Always refresh data on any change
          onRefresh();
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
