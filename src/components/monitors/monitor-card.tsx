import Link from "next/link";
import type { Monitor } from "@/lib/types/monitor";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";

export function MonitorCard({ monitor }: { monitor: Monitor }) {
  const status = monitor.status === "operating" ? "healthy" : monitor.status === "degraded" ? "degraded" : monitor.status === "down" ? "down" : "paused";
  return (
    <Link href={`/monitors/${monitor.id}`} className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-violet-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="flex items-center gap-2"><StatusDot status={status}/><h3 className="truncate text-sm font-semibold text-slate-900">{monitor.name}</h3></div><p className="mt-2 truncate font-mono text-xs text-slate-600">{monitor.url}</p></div>
        <Badge variant={monitor.status === "operating" ? "success" : monitor.status === "down" ? "danger" : monitor.status === "degraded" ? "warning" : "default"}>{monitor.status}</Badge>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
        <div><p className="text-xs text-slate-600">Interval</p><p className="mt-1 font-mono text-xs text-slate-600">{Math.round(monitor.interval_seconds / 60)}m</p></div>
        <div><p className="text-xs text-slate-600">Failures</p><p className="mt-1 font-mono text-xs text-slate-600">{monitor.consecutive_failures}</p></div>
        <div><p className="text-xs text-slate-600">Checked</p><p className="mt-1 text-xs text-slate-600">{monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "Never"}</p></div>
      </div>
    </Link>
  );
}
