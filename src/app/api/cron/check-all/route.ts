import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runLiveHttpCheck } from "@/lib/network/http-client";
import { applyMonitorLifecycle } from "@/lib/incidents/lifecycle";
import { errorJson, successJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return runChecks(request);
}

export async function POST(request: NextRequest) {
  return runChecks(request);
}

async function runChecks(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return errorJson("Unauthorized", 401, "UNAUTHORIZED");
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: monitors, error } = await admin
    .from("monitors")
    .select("*, project:projects(workspace_id)")
    .eq("is_active", true)
    .lte("next_check_at", now)
    .limit(100);
  if (error) return errorJson(error.message, 500, "MONITOR_CRON_FAILED");

  let checked = 0;
  let failed = 0;
  let recovered = 0;

  for (const monitor of monitors ?? []) {
    const project = monitor.project as { workspace_id: string };
    if (!project?.workspace_id) continue;
    const headers = monitor.headers && typeof monitor.headers === "object" && !Array.isArray(monitor.headers)
      ? monitor.headers as Record<string, string>
      : {};
    const result = await runLiveHttpCheck(monitor.url, { method: monitor.method, headers, timeoutMs: monitor.timeout_ms });
    const expected = monitor.expected_status_codes as number[];
    const successful = !result.error && expected.includes(result.status);
    const pingStatus = successful ? "success" : result.error?.includes("timed out") ? "timeout" : "failure";
    checked += 1;

    await admin.from("ping_logs").insert({
      monitor_id: monitor.id,
      status: pingStatus,
      http_status: result.status || null,
      latency_ms: result.latencyMs,
      payload_size_bytes: result.payloadSizeBytes,
      response_headers: result.responseHeaders,
      error_message: result.error ?? null,
      response_excerpt: result.body.slice(0, 4000),
    });

    const previousStatus = monitor.status;
    const nextStatus = successful ? "operating" : "down";
    await admin.from("monitors").update({
      status: nextStatus,
      last_checked_at: now,
      next_check_at: new Date(Date.now() + monitor.interval_seconds * 1000).toISOString(),
      consecutive_failures: successful ? 0 : (monitor.consecutive_failures ?? 0) + 1,
    }).eq("id", monitor.id);

    if (!successful) failed += 1;
    if (successful && previousStatus === "down") recovered += 1;

    await applyMonitorLifecycle(admin, project.workspace_id, {
      id: monitor.id,
      project_id: monitor.project_id,
      name: monitor.name,
      url: monitor.url,
      status: previousStatus,
    }, successful);
  }

  return successJson({ checked, failed, recovered, skipped: 0 });
}
