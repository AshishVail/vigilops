import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export function subscribeToTable(
  table: keyof Database["public"]["Tables"],
  event: RealtimeEvent,
  callback: () => void,
  filter?: string,
): RealtimeChannel {
  const supabase = createClient();
  const channelName = `vigilops:${table}:${filter ?? "all"}:${event}`;

  const channel = supabase.channel(channelName);
  channel.on(
    "postgres_changes",
    { event, schema: "public", table, filter },
    () => callback(),
  );
  channel.subscribe();
  return channel;
}
