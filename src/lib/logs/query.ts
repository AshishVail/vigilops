import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { NormalizedLog } from "@/lib/logs/normalize";

export type LogQueryFilters = {
  projectId: string;
  service?: "monitor" | "api" | "security" | "incident";
  statusGroup?: "2xx" | "4xx" | "5xx" | "timeout" | "error";
  search?: string;
  from?: string;
  to?: string;
  requestId?: string;
  limit?: number;
};

export async function queryNormalizedLogs(
  supabase: SupabaseClient<Database>,
  filters: LogQueryFilters,
) {
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const logs: NormalizedLog[] = [];

  if (!filters.service || filters.service === "monitor") {
    let query = supabase
      .from("ping_logs")
      .select("id, request_id, monitor_id, status, http_status, latency_ms, payload_size_bytes, error_message, checked_at")
      .gte("checked_at", filters.from ?? "1970-01-01T00:00:00.000Z")
      .lte("checked_at", filters.to ?? "2999-12-31T23:59:59.999Z")
      .order("checked_at", { ascending: false })
      .limit(limit);
    if (filters.requestId) query = query.eq("request_id", filters.requestId);
    const { data: monitors } = await supabase.from("monitors").select("id,name,url").eq("project_id", filters.projectId);
    const monitorById = new Map((monitors ?? []).map((monitor) => [monitor.id, monitor]));
    let monitorIds = (monitors ?? []).map((monitor) => monitor.id);
    if (filters.requestId) monitorIds = monitorIds;
    if (monitorIds.length) {
      query = query.in("monitor_id", monitorIds);
      const { data } = await query;
      for (const row of data ?? []) {
        const monitor = monitorById.get(row.monitor_id);
        logs.push({
          id: row.id,
          requestId: row.request_id,
          timestamp: row.checked_at,
          source: "monitor",
          level: row.status === "success" ? "success" : row.status === "timeout" ? "warning" : "error",
          statusCode: row.http_status,
          url: monitor?.url ?? null,
          service: monitor?.name ?? "Monitor",
          latencyMs: row.latency_ms,
          payloadSizeBytes: row.payload_size_bytes,
          message: row.error_message ?? `Monitor check ${row.status}`,
          details: { status: row.status, httpStatus: row.http_status },
        });
      }
    }
  }

  if (!filters.service || filters.service === "api") {
    let query = supabase
      .from("api_runs")
      .select("id, request_id_header, method, url, http_status, latency_ms, payload_size_bytes, error_message, executed_at")
      .eq("project_id", filters.projectId)
      .gte("executed_at", filters.from ?? "1970-01-01T00:00:00.000Z")
      .lte("executed_at", filters.to ?? "2999-12-31T23:59:59.999Z")
      .order("executed_at", { ascending: false })
      .limit(limit);
    if (filters.requestId) query = query.eq("request_id_header", filters.requestId);
    const { data } = await query;
    for (const row of data ?? []) {
      logs.push({
        id: row.id,
        requestId: row.request_id_header,
        timestamp: row.executed_at,
        source: "api",
        level: row.http_status && row.http_status >= 400 ? "error" : row.error_message ? "error" : "success",
        statusCode: row.http_status,
        url: row.url,
        service: `${row.method} API request`,
        latencyMs: row.latency_ms,
        payloadSizeBytes: row.payload_size_bytes,
        message: row.error_message ?? `API request returned ${row.http_status ?? "no status"}`,
        details: { method: row.method },
      });
    }
  }

  if (!filters.service || filters.service === "security") {
    const { data } = await supabase
      .from("security_scans")
      .select("id, domain, security_score, grade, findings, scanned_at")
      .eq("project_id", filters.projectId)
      .gte("scanned_at", filters.from ?? "1970-01-01T00:00:00.000Z")
      .lte("scanned_at", filters.to ?? "2999-12-31T23:59:59.999Z")
      .order("scanned_at", { ascending: false })
      .limit(limit);
    for (const row of data ?? []) {
      logs.push({
        id: row.id,
        requestId: null,
        timestamp: row.scanned_at,
        source: "security",
        level: row.security_score < 65 ? "error" : row.security_score < 85 ? "warning" : "success",
        statusCode: null,
        url: `https://${row.domain}`,
        service: "Security scanner",
        latencyMs: null,
        payloadSizeBytes: null,
        message: `Security scan graded ${row.grade} (${row.security_score}/100)`,
        details: { grade: row.grade, score: row.security_score, findings: row.findings },
      });
    }
  }

  if (!filters.service || filters.service === "incident") {
    const query = supabase
      .from("incidents")
      .select("id, title, status, severity, summary, started_at")
      .eq("project_id", filters.projectId)
      .gte("started_at", filters.from ?? "1970-01-01T00:00:00.000Z")
      .lte("started_at", filters.to ?? "2999-12-31T23:59:59.999Z")
      .order("started_at", { ascending: false })
      .limit(limit);
    const { data } = await query;
    for (const row of data ?? []) {
      logs.push({
        id: row.id,
        requestId: null,
        timestamp: row.started_at,
        source: "incident",
        level: row.status === "resolved" ? "success" : row.severity === "critical" || row.severity === "high" ? "error" : "warning",
        statusCode: null,
        url: null,
        service: "Incident management",
        latencyMs: null,
        payloadSizeBytes: null,
        message: row.title,
        details: { status: row.status, severity: row.severity, summary: row.summary },
      });
    }
  }

  if (!filters.service) {
    const { data: workspaceProjects } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", (
        await supabase
          .from("projects")
          .select("workspace_id")
          .eq("id", filters.projectId)
          .maybeSingle()
      ).data?.workspace_id ?? "");
    const projectIds = (workspaceProjects ?? []).map((project) => project.id);
    if (projectIds.length) {
      const { data: channels } = await supabase
        .from("alert_channels")
        .select("id,name,type")
        .in("project_id", projectIds);
      const channelById = new Map((channels ?? []).map((channel) => [channel.id, channel]));
      const channelIds = (channels ?? []).map((channel) => channel.id);
      if (channelIds.length) {
        const { data: deliveries } = await supabase
          .from("alert_deliveries")
          .select("id, channel_id, event_type, status, error_message, attempted_at")
          .in("channel_id", channelIds)
          .gte("attempted_at", filters.from ?? "1970-01-01T00:00:00.000Z")
          .lte("attempted_at", filters.to ?? "2999-12-31T23:59:59.999Z")
          .order("attempted_at", { ascending: false })
          .limit(limit);
        for (const row of deliveries ?? []) {
          const channel = channelById.get(row.channel_id);
          logs.push({
            id: row.id,
            requestId: null,
            timestamp: row.attempted_at,
            source: "alert",
            level: row.status === "succeeded" ? "success" : row.status === "failed" ? "error" : "warning",
            statusCode: null,
            url: null,
            service: channel?.name ?? "Alert channel",
            latencyMs: null,
            payloadSizeBytes: null,
            message: row.error_message ?? `${row.event_type} alert ${row.status}`,
            details: { eventType: row.event_type, channelType: channel?.type ?? null, deliveryStatus: row.status },
          });
        }
      }
    }
  }

  let filtered = logs;
  if (filters.statusGroup) {
    filtered = filtered.filter((log) => {
      if (filters.statusGroup === "timeout") return log.level === "warning" && log.source === "monitor";
      if (filters.statusGroup === "error") return log.level === "error";
      if (!log.statusCode) return false;
      if (filters.statusGroup === "2xx") return log.statusCode >= 200 && log.statusCode < 300;
      if (filters.statusGroup === "4xx") return log.statusCode >= 400 && log.statusCode < 500;
      return log.statusCode >= 500 && log.statusCode < 600;
    });
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter((log) =>
      log.service.toLowerCase().includes(search) ||
      log.message.toLowerCase().includes(search) ||
      log.url?.toLowerCase().includes(search),
    );
  }

  filtered.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  const items = filtered.slice(0, limit);
  return { items, nextCursor: filtered.length > limit ? items.at(-1)?.id ?? null : null };
}
