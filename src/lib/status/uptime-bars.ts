export type PublicUptimeDay = {
  date: string;
  uptime: number;
  status: "operating" | "degraded" | "down";
};

export function buildUptimeBars(
  statuses: Array<{ checked_at: string; status: "success" | "failure" | "timeout" | "error" }>,
  days = 90,
) {
  const buckets = new Map<string, { total: number; successful: number }>();
  for (const ping of statuses) {
    const date = new Date(ping.checked_at);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    const bucket = buckets.get(key) ?? { total: 0, successful: 0 };
    bucket.total += 1;
    if (ping.status === "success") bucket.successful += 1;
    buckets.set(key, bucket);
  }

  const result: PublicUptimeDay[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    const key = date.toISOString();
    const bucket = buckets.get(key);
    const uptime = bucket ? (bucket.successful / bucket.total) * 100 : 100;
    result.push({
      date: key,
      uptime,
      status: uptime >= 99 ? "operating" : uptime >= 95 ? "degraded" : "down",
    });
  }
  return result;
}
