import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { DashboardRange } from "@/lib/types/dashboard";
import { rangeStart } from "@/lib/analytics/uptime";

export type LatencyPoint = {
  time: string;
  average: number;
  p50: number;
  p95: number;
};

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

export async function getLatencySeries(
  supabase: SupabaseClient<Database>,
  monitorIds: string[],
  range: DashboardRange,
) {
  if (monitorIds.length === 0) return { average: 0, points: [] as LatencyPoint[] };

  const { data, error } = await supabase
    .from("ping_logs")
    .select("latency_ms, checked_at")
    .in("monitor_id", monitorIds)
    .gte("checked_at", rangeStart(range))
    .order("checked_at", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return { average: 0, points: [] as LatencyPoint[] };

  const average = rows.reduce((sum, row) => sum + row.latency_ms, 0) / rows.length;
  const bucketHours = range === "24h" ? 1 : range === "7d" ? 12 : 24;
  const buckets = new Map<string, number[]>();

  for (const row of rows) {
    const date = new Date(row.checked_at);
    date.setMinutes(0, 0, 0);
    if (bucketHours === 12) date.setHours(date.getHours() < 12 ? 0 : 12);
    if (bucketHours === 24) date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    const values = buckets.get(key) ?? [];
    values.push(row.latency_ms);
    buckets.set(key, values);
  }

  const points = Array.from(buckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([time, values]) => ({
      time,
      average: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)),
      p50: percentile(values, 0.50),
      p95: percentile(values, 0.95),
    }));

  return { average: Math.round(average), points };
}
