import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { DashboardRange } from "@/lib/types/dashboard";
import { rangeStart } from "@/lib/analytics/uptime";

export type TrafficPoint = {
  time: string;
  checks: number;
  errors: number;
};

export async function getTrafficSeries(
  supabase: SupabaseClient<Database>,
  monitorIds: string[],
  range: DashboardRange,
) {
  if (monitorIds.length === 0) return [] as TrafficPoint[];

  const { data, error } = await supabase
    .from("ping_logs")
    .select("status, checked_at")
    .in("monitor_id", monitorIds)
    .gte("checked_at", rangeStart(range))
    .order("checked_at", { ascending: true });

  if (error) throw new Error(error.message);
  const bucketHours = range === "24h" ? 1 : range === "7d" ? 12 : 24;
  const buckets = new Map<string, { checks: number; errors: number }>();

  for (const row of data ?? []) {
    const date = new Date(row.checked_at);
    date.setMinutes(0, 0, 0);
    if (bucketHours === 12) date.setHours(date.getHours() < 12 ? 0 : 12);
    if (bucketHours === 24) date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    const bucket = buckets.get(key) ?? { checks: 0, errors: 0 };
    bucket.checks += 1;
    if (row.status !== "success") bucket.errors += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([time, bucket]) => ({ time, ...bucket }));
}
