import type { PublicUptimeDay } from "@/lib/status/uptime-bars";

export function PublicUptimeBars({ days }: { days: PublicUptimeDay[] }) {
  return <div className="flex h-9 items-end gap-[2px]" title="90-day uptime">{days.map((day)=><span key={day.date} title={`${new Date(day.date).toLocaleDateString()}: ${day.uptime.toFixed(2)}%`} className={`h-full flex-1 rounded-sm ${day.status==="operating"?"bg-emerald-500":day.status==="degraded"?"bg-amber-500":"bg-rose-500"}`}/>)}</div>;
}
