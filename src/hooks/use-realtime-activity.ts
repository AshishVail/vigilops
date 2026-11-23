"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { subscribeToTable } from "@/lib/supabase/realtime";

export function useRealtimeActivity(callback: () => void) {
  useEffect(() => {
    const channels: RealtimeChannel[] = [
      subscribeToTable("ping_logs", "*", callback),
      subscribeToTable("incidents", "*", callback),
      subscribeToTable("activity_events", "INSERT", callback),
    ];
    return () => {
      for (const channel of channels) void channel.unsubscribe();
    };
  }, [callback]);
}
