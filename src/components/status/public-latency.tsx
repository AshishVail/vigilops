import type { PublicMonitor } from "@/lib/status/public-query";

export function PublicLatency({ monitor }: { monitor: PublicMonitor }) {
  return <p className="mt-3 font-mono text-[11px] text-slate-500">Avg latency <span className="text-slate-300">{monitor.averageLatencyMs} ms</span></p>;
}
