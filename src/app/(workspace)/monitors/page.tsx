"use client";

import Link from "next/link";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useMonitors } from "@/hooks/use-monitors";
import { MonitorList } from "@/components/monitors/monitor-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitorsPage() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const projectId = useWorkspaceStore((state) => state.projectId);
  const monitors = useMonitors(projectId, workspaceId);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Infrastructure</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Monitors</h1></div>
        <Link href="/monitors/new"><Button>Create monitor</Button></Link>
      </div>
      {monitors.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map((item)=><Skeleton key={item} className="h-44"/>)}</div> : monitors.error ? <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{monitors.error.message}</p> : <MonitorList monitors={monitors.data ?? []}/>}
    </div>
  );
}
