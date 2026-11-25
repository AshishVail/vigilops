import type { PublicMonitor } from "@/lib/status/public-query";
import { PublicUptimeBars } from "@/components/status/public-uptime-bars";
import { StatusDot } from "@/components/ui/status-dot";
import { PublicLatency } from "@/components/status/public-latency";

export function PublicMonitorCard({ monitor }: { monitor: PublicMonitor }) {
  const dotStatus = monitor.status === "operating" ? "healthy" : monitor.status;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-2"><StatusDot status={dotStatus}/><h2 className="text-sm font-semibold">{monitor.name}</h2></div><div className="text-right"><p className="font-mono text-xs text-slate-600">{monitor.uptime.toFixed(2)}%</p><p className="mt-1 text-[10px] text-slate-600">90-day uptime</p></div></div>
      <div className="mt-5"><PublicUptimeBars days={monitor.uptimeBars}/></div>
      <PublicLatency monitor={monitor}/>
    </article>
  );
}
