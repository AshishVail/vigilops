"use client";

import { use, useCallback } from "react";
import { useMonitor } from "@/hooks/use-monitors";
import { usePingHistory } from "@/hooks/use-ping-history";
import { useMonitorLive } from "@/hooks/use-monitor-live";
import { MonitorActions } from "@/components/monitors/monitor-actions";
import { UptimeBars } from "@/components/monitors/uptime-bars";
import { PingHistory } from "@/components/monitors/ping-history";
import { LatencyHistogram } from "@/components/monitors/latency-histogram";
import { MonitorStatusChart } from "@/components/monitors/monitor-status-chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitorDetailPage({ params }: { params: Promise<{ monitorId: string }> }) {
  const { monitorId } = use(params);
  const monitor = useMonitor(monitorId);
  const history = usePingHistory(monitorId, 90);
  const refresh = useCallback(() => { void monitor.refetch(); void history.refetch(); }, [monitor, history]);
  useMonitorLive(monitorId, refresh);
  const logs = history.data?.pages.flatMap((page) => page.items) ?? [];

  if (monitor.isLoading) return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-12 w-72"/><Skeleton className="h-28"/><Skeleton className="h-72"/></div>;
  if (!monitor.data) return <div className="p-5 lg:p-8"><p className="text-sm text-slate-600">Monitor not found.</p></div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><Badge variant={monitor.data.status==="operating"?"success":monitor.data.status==="down"?"danger":monitor.data.status==="degraded"?"warning":"default"}>{monitor.data.status}</Badge><h1 className="mt-3 text-2xl font-semibold tracking-tight">{monitor.data.name}</h1><p className="mt-1 font-mono text-xs text-slate-600">{monitor.data.url}</p></div>
        <MonitorActions monitor={monitor.data}/>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium">Recent uptime</p><p className="font-mono text-xs text-slate-600">{Math.round(monitor.data.interval_seconds/60)}m interval · {monitor.data.timeout_ms}ms timeout</p></div><UptimeBars logs={logs} count={90}/></section>
      <div className="grid gap-4 xl:grid-cols-2"><MonitorStatusChart logs={logs}/><LatencyHistogram logs={logs}/></div>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Ping history</h2>{history.hasNextPage&&<button onClick={()=>history.fetchNextPage()} className="text-xs text-violet-700">Load more</button>}</div><PingHistory logs={logs}/></section>
    </div>
  );
}
