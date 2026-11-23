import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { DashboardRange } from "@/lib/types/dashboard";

export type UptimePoint = {
  time: string;
  uptime: number;
  failures: number;
};

export function rangeStart(range: DashboardRange) {
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export async function getUptimeSummary(
  supabase: SupabaseClient<Database>,
  monitorIds: string[],
  range: DashboardRange,
) {
  if (monitorIds.length === 0) return { uptime: 100, points: [] as UptimePoint[] };

  const { data, error } = await supabase
    .from("ping_logs")
    .select("status, checked_at")
    .in("monitor_id", monitorIds)
    .gte("checked_at", rangeStart(range))
    .order("checked_at", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return { uptime: 100, points: [] as UptimePoint[] };

  const uptime = (rows.filter((row) => row.status === "success").length / rows.length) * 100;
  const bucketHours = range === "24h" ? 1 : range === "7d" ? 12 : 24;
  const buckets = new Map<string, { total: number; successes: number; failures: number }>();

  for (const row of rows) {
    const date = new Date(row.checked_at);
    date.setMinutes(0, 0, 0);
    if (bucketHours === 12) date.setHours(date.getHours() < 12 ? 0 : 12);
    if (bucketHours === 24) date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    const bucket = buckets.get(key) ?? { total: 0, successes: 0, failures: 0 };
    bucket.total += 1;
    if (row.status === "success") bucket.successes += 1;
    else bucket.failures += 1;
    buckets.set(key, bucket);
  }

  const points = Array.from(buckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([time, bucket]) => ({
      time,
      uptime: bucket.total === 0 ? 100 : (bucket.successes / bucket.total) * 100,
      failures: bucket.failures,
    }));

  return { uptime: Number(uptime.toFixed(2)), points };
}
