import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildUptimeBars } from "@/lib/status/uptime-bars";
import type { PublicIncident } from "@/lib/status/incident-history";

export type PublicMonitor = {
  name: string;
  status: "operating" | "degraded" | "down" | "paused";
  averageLatencyMs: number;
  uptime: number;
  uptimeBars: ReturnType<typeof buildUptimeBars>;
};

export type PublicStatusData = {
  name: string;
  slug: string;
  overallStatus: "operating" | "degraded" | "down";
  monitors: PublicMonitor[];
  incidents: PublicIncident[];
};

export async function getPublicStatus(workspaceSlug: string): Promise<PublicStatusData | null> {
  const supabase = createAdminClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id,name,slug,public_status_enabled")
    .eq("slug", workspaceSlug)
    .eq("public_status_enabled", true)
    .maybeSingle();
  if (!workspace) return null;

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("public_status_enabled", true);
  const projectIds = (projects ?? []).map((project) => project.id);
  if (!projectIds.length) {
    return { name: workspace.name, slug: workspace.slug, overallStatus: "operating", monitors: [], incidents: [] };
  }

  const { data: monitorRows } = await supabase
    .from("monitors")
    .select("id,name,status")
    .in("project_id", projectIds)
    .eq("is_active", true);

  const monitors: PublicMonitor[] = [];
  for (const monitor of monitorRows ?? []) {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: pings } = await supabase
      .from("ping_logs")
      .select("status, latency_ms, checked_at")
      .eq("monitor_id", monitor.id)
      .gte("checked_at", since)
      .order("checked_at", { ascending: false })
      .limit(1000);
    const rows = pings ?? [];
    const successful = rows.filter((ping) => ping.status === "success").length;
    const uptime = rows.length ? (successful / rows.length) * 100 : 100;
    const averageLatencyMs = rows.length
      ? Math.round(rows.reduce((sum, ping) => sum + ping.latency_ms, 0) / rows.length)
      : 0;
    monitors.push({
      name: monitor.name,
      status: monitor.status,
      averageLatencyMs,
      uptime,
      uptimeBars: buildUptimeBars(rows.map((ping) => ({ checked_at: ping.checked_at, status: ping.status }))),
    });
  }

  const { data: incidentRows } = await supabase
    .from("incidents")
    .select("title,status,severity,started_at,resolved_at")
    .in("project_id", projectIds)
    .order("started_at", { ascending: false })
    .limit(20);
  const incidents: PublicIncident[] = (incidentRows ?? []).map((incident) => ({
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    startedAt: incident.started_at,
    resolvedAt: incident.resolved_at,
  }));

  const overallStatus = monitors.some((monitor) => monitor.status === "down")
    ? "down"
    : monitors.some((monitor) => monitor.status === "degraded")
      ? "degraded"
      : "operating";
  return { name: workspace.name, slug: workspace.slug, overallStatus, monitors, incidents };
}
