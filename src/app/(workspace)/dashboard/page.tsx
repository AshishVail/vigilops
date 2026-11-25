"use client";

import { useCallback, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { DashboardRange } from "@/lib/types/dashboard";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { LatencyChart } from "@/components/dashboard/latency-chart";
import { TrafficChart } from "@/components/dashboard/traffic-chart";
import { UptimeChart } from "@/components/dashboard/uptime-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { IncidentTimeline } from "@/components/dashboard/incident-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspaces } from "@/hooks/use-workspace";

export default function DashboardPage() {
  const workspaces = useWorkspaces();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const projectId = useWorkspaceStore((state) => state.projectId);
  const [range, setRange] = useState<DashboardRange>("24h");
  const query = useDashboard(workspaceId, projectId, range);

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);
  useRealtimeActivity(refresh);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Command Center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Operational overview</h1>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {workspaces.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-28"/>)}</div>
      )}

      {workspaces.error && (
        <EmptyState
          title="Workspaces unavailable"
          description={workspaces.error instanceof Error ? workspaces.error.message : "Unable to load your workspaces."}
          action={<Button variant="outline" onClick={() => void workspaces.refetch()}>Retry</Button>}
        />
      )}

      {workspaces.isSuccess && workspaces.data.length === 0 && (
        <EmptyState
          title="Create your first workspace"
          description="A workspace is needed to organize projects, monitors, and incidents."
          action={<Link href="/settings"><Button>Open workspace settings</Button></Link>}
        />
      )}

      {workspaces.isSuccess && workspaces.data.length > 0 && !workspaceId && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-28"/>)}</div>
      )}

      {workspaceId && query.isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-28"/>)}</div>
          <div className="grid gap-4 xl:grid-cols-2">{[0,1].map((item)=><Skeleton key={item} className="h-[340px]"/>)}</div>
        </div>
      )}

      {workspaceId && query.error && (
        <EmptyState title="Dashboard unavailable" description={query.error instanceof Error ? query.error.message : "Unable to load operational data."} />
      )}

      {workspaceId && query.data && (
        <>
          <KpiGrid data={query.data} />
          <div className="grid gap-4 xl:grid-cols-2">
            <LatencyChart data={query.data.latency.points} />
            <TrafficChart data={query.data.traffic} />
          </div>
          <UptimeChart data={query.data.uptime.points} />
          <div className="grid gap-4 xl:grid-cols-2">
            <ActivityFeed data={query.data.activity} />
            <IncidentTimeline data={query.data.incidents} />
          </div>
        </>
      )}
    </div>
  );
}
