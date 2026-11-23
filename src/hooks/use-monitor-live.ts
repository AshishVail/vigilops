"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { subscribeToTable } from "@/lib/supabase/realtime";

export function useMonitorLive(monitorId: string | null, callback: () => void) {
  useEffect(() => {
    if (!monitorId) return;
    const channels: RealtimeChannel[] = [
      subscribeToTable("ping_logs", "*", callback, `monitor_id=eq.${monitorId}`),
      subscribeToTable("monitors", "UPDATE", callback, `id=eq.${monitorId}`),
    ];
    return () => {
      for (const channel of channels) void channel.unsubscribe();
    };
  }, [monitorId, callback]);
}
