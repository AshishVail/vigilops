import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runLiveHttpCheck } from "@/lib/network/http-client";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const body = await request.json().catch(() => null) as { monitorId?: unknown } | null;
  if (!body || typeof body.monitorId !== "string") return errorJson("monitorId is required", 400, "VALIDATION_ERROR");

  const { data: monitor } = await auth.supabase
    .from("monitors")
    .select("*, project:projects(workspace_id)")
    .eq("id", body.monitorId)
    .maybeSingle();
  if (!monitor) return forbiddenJson();

  const project = monitor.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const headers = monitor.headers && typeof monitor.headers === "object" && !Array.isArray(monitor.headers)
    ? monitor.headers as Record<string, string>
    : {};
  const result = await runLiveHttpCheck(monitor.url, { method: monitor.method, headers, timeoutMs: monitor.timeout_ms });
  const expected = monitor.expected_status_codes as number[];
  const successful = !result.error && expected.includes(result.status);
  const status = successful ? "success" : result.error?.includes("timed out") ? "timeout" : "failure";
  const monitorStatus = successful ? "operating" : "down";

  const admin = createAdminClient();
  const { data: ping, error: pingError } = await admin.from("ping_logs").insert({
    monitor_id: monitor.id,
    status,
    http_status: result.status || null,
    latency_ms: result.latencyMs,
    payload_size_bytes: result.payloadSizeBytes,
    response_headers: result.responseHeaders,
    error_message: result.error ?? null,
    response_excerpt: result.body.slice(0, 4000),
  }).select("*").single();
  if (pingError) return errorJson(pingError.message, 500, "PING_LOG_FAILED");

  const { error: monitorError } = await admin.from("monitors").update({
    status: monitorStatus,
    is_active: monitor.is_active,
    last_checked_at: new Date().toISOString(),
    next_check_at: new Date(Date.now() + monitor.interval_seconds * 1000).toISOString(),
    consecutive_failures: successful ? 0 : (monitor.consecutive_failures ?? 0) + 1,
  }).eq("id", monitor.id);
  if (monitorError) return errorJson(monitorError.message, 500, "MONITOR_UPDATE_FAILED");

  await admin.from("activity_events").insert({
    workspace_id: project.workspace_id,
    project_id: monitor.project_id,
    type: "ping_completed",
    title: `${monitor.name} ${successful ? "responded successfully" : "is failing"}`,
    metadata: { monitorId: monitor.id, status: result.status, latencyMs: result.latencyMs },
    actor_id: auth.user.id,
  });

  return successJson({
    ping,
    result: {
      status: result.status,
      statusText: result.statusText,
      latencyMs: result.latencyMs,
      payloadSizeBytes: result.payloadSizeBytes,
      responseHeaders: result.responseHeaders,
      timing: result.timing,
      truncated: result.truncated,
      error: result.error,
    },
  });
}
