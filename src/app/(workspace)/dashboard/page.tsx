"use client";

import { useCallback, useState } from "react";
import { Activity, ArrowRight, BellRing, Globe2, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { useSecurityScans } from "@/hooks/use-security-scans";
import { CreateIncidentDialog } from "@/components/incidents/create-incident-dialog";
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
  const projects = useProjects(workspaceId);
  const activeProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const scans = useSecurityScans(activeProjectId, workspaceId);
  const [range, setRange] = useState<DashboardRange>("24h");
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const query = useDashboard(workspaceId, projectId, range);
  const activeWorkspace = workspaces.data?.find(({ workspace }) => workspace.id === workspaceId)?.workspace;
  const recentScan = scans.data?.[0];

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);
  useRealtimeActivity(refresh);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Command Center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Operational overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void query.refetch()} disabled={!workspaceId || query.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />Refresh</Button>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {workspaceId && <section aria-label="Quick actions" className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Link href="/monitors/new" className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700"><Plus className="h-4 w-4" />New monitor</Link>
        <Link href="/security" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><ShieldCheck className="h-4 w-4 text-indigo-600" />Run security scan</Link>
        <Link href="/observatory" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Globe2 className="h-4 w-4 text-indigo-600" />API observatory</Link>
        <Button variant="outline" size="sm" disabled={!activeProjectId} onClick={() => setIncidentDialogOpen(true)}><BellRing className="h-4 w-4 text-indigo-600" />Create incident</Button>
        {activeWorkspace?.public_status_enabled
          ? <Link href={`/status/${activeWorkspace.slug}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Activity className="h-4 w-4 text-emerald-600" />View status page</Link>
          : <Link href="/settings" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Activity className="h-4 w-4 text-slate-500" />Set up status page</Link>}
      </section>}

      {workspaceId && <section className="grid gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-white p-5 shadow-sm md:grid-cols-[1.2fr_repeat(3,.8fr)]">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-600">Workspace health overview</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{activeWorkspace?.name ?? "Your workspace"}</h2>
          <p className="mt-2 text-sm text-slate-600">{query.data?.kpis.activeMonitors ? "Your services are being monitored. Review the latest signals below." : "Start with a live monitor to begin building your operational picture."}</p>
          {!query.data?.kpis.activeMonitors && <Link href="/monitors/new" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">Add your first monitor <ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4"><p className="text-xs text-slate-600">Active monitors</p><p className="mt-2 font-mono text-2xl font-semibold text-slate-900">{query.data?.kpis.activeMonitors ?? "—"}</p><p className="mt-1 text-[11px] text-slate-600">Live service checks</p></div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4"><p className="text-xs text-slate-600">Latest security score</p><p className="mt-2 font-mono text-2xl font-semibold text-slate-900">{recentScan ? `${recentScan.security_score}/100` : "—"}</p><p className="mt-1 text-[11px] text-slate-600">{recentScan ? `Grade ${recentScan.grade} · ${recentScan.domain}` : "Run a scan to establish a baseline"}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4"><p className="text-xs text-slate-600">Open incidents</p><p className="mt-2 font-mono text-2xl font-semibold text-slate-900">{query.data?.kpis.openIncidents ?? "—"}</p><p className="mt-1 text-[11px] text-slate-600">Current workspace</p></div>
      </section>}

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
      {workspaceId && activeProjectId && <CreateIncidentDialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen} projectId={activeProjectId} />}
    </div>
  );
}
