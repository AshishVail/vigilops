import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { DashboardRange } from "@/lib/types/dashboard";
import { getUptimeSummary } from "@/lib/analytics/uptime";
import { getLatencySeries } from "@/lib/analytics/latency";
import { getTrafficSeries } from "@/lib/analytics/traffic";

export type DashboardData = {
  range: DashboardRange;
  kpis: {
    uptime: number;
    averageLatency: number;
    activeMonitors: number;
    openIncidents: number;
  };
  latency: Awaited<ReturnType<typeof getLatencySeries>>;
  traffic: Awaited<ReturnType<typeof getTrafficSeries>>;
  uptime: Awaited<ReturnType<typeof getUptimeSummary>>;
  activity: Array<{ id: string; type: string; title: string; createdAt: string; projectId: string | null }>;
  incidents: Array<{ id: string; title: string; status: string; severity: string; startedAt: string }>;
};

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  projectId: string | null,
  range: DashboardRange,
): Promise<DashboardData> {
  let projectQuery = supabase.from("projects").select("id").eq("workspace_id", workspaceId);
  if (projectId) projectQuery = projectQuery.eq("id", projectId);
  const { data: projects, error: projectsError } = await projectQuery;
  if (projectsError) throw new Error(projectsError.message);
  const projectIds = (projects ?? []).map((project) => project.id);

  let monitorQuery = supabase
    .from("monitors")
    .select("id, status")
    .eq("is_active", true);
  if (projectIds.length === 0) monitorQuery = monitorQuery.in("project_id", ["00000000-0000-0000-0000-000000000000"]);
  else monitorQuery = monitorQuery.in("project_id", projectIds);
  const { data: monitors, error: monitorsError } = await monitorQuery;
  if (monitorsError) throw new Error(monitorsError.message);
  const activeMonitors = monitors ?? [];
  const monitorIds = activeMonitors.map((monitor) => monitor.id);

  let incidentsQuery = supabase
    .from("incidents")
    .select("id, title, status, severity, started_at")
    .neq("status", "resolved")
    .order("started_at", { ascending: false })
    .limit(8);
  if (projectIds.length > 0) incidentsQuery = incidentsQuery.in("project_id", projectIds);
  else incidentsQuery = incidentsQuery.in("project_id", ["00000000-0000-0000-0000-000000000000"]);
  const { data: incidents, error: incidentsError } = await incidentsQuery;
  if (incidentsError) throw new Error(incidentsError.message);

  const { data: activity, error: activityError } = await supabase
    .from("activity_events")
    .select("id, type, title, created_at, project_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (activityError) throw new Error(activityError.message);

  const [uptime, latency, traffic] = await Promise.all([
    getUptimeSummary(supabase, monitorIds, range),
    getLatencySeries(supabase, monitorIds, range),
    getTrafficSeries(supabase, monitorIds, range),
  ]);

  return {
    range,
    kpis: {
      uptime: uptime.uptime,
      averageLatency: latency.average,
      activeMonitors: activeMonitors.length,
      openIncidents: incidents?.length ?? 0,
    },
    latency,
    traffic,
    uptime,
    activity: (activity ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      createdAt: item.created_at,
      projectId: item.project_id,
    })),
    incidents: (incidents ?? []).map((incident) => ({
      id: incident.id,
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      startedAt: incident.started_at,
    })),
  };
}
