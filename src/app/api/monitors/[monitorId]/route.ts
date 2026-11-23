import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateMonitorSchema } from "@/lib/validations/monitor";
import { validateSafeUrl } from "@/lib/network/url-safety";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

async function getMonitorWithAccess(auth: Awaited<ReturnType<typeof requireAuth>>, monitorId: string) {
  if (!auth) return null;
  const { data: monitor } = await auth.supabase
    .from("monitors")
    .select("*, project:projects(workspace_id)")
    .eq("id", monitorId)
    .maybeSingle();
  if (!monitor) return null;
  const project = monitor.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { monitor, project, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ monitorId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { monitorId } = await context.params;
  const access = await getMonitorWithAccess(auth, monitorId);
  if (!access) return forbiddenJson();
  return successJson(access.monitor);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ monitorId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { monitorId } = await context.params;
  const access = await getMonitorWithAccess(auth, monitorId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();

  const parsed = updateMonitorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid monitor data", 400, "VALIDATION_ERROR");
  if (parsed.data.url) {
    try { await validateSafeUrl(parsed.data.url); } catch (error) { return errorJson(error instanceof Error ? error.message : "Invalid URL", 400, "UNSAFE_URL"); }
  }

  const updates: {
    name?: string;
    url?: string;
    method?: string;
    interval_seconds?: number;
    timeout_ms?: number;
    expected_status_codes?: number[];
    headers?: Record<string, string>;
    is_active?: boolean;
  } = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.url !== undefined) updates.url = parsed.data.url;
  if (parsed.data.method !== undefined) updates.method = parsed.data.method;
  if (parsed.data.intervalSeconds !== undefined) updates.interval_seconds = parsed.data.intervalSeconds;
  if (parsed.data.timeoutMs !== undefined) updates.timeout_ms = parsed.data.timeoutMs;
  if (parsed.data.expectedStatusCodes !== undefined) updates.expected_status_codes = parsed.data.expectedStatusCodes;
  if (parsed.data.headers !== undefined) updates.headers = parsed.data.headers;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const admin = createAdminClient();
  const { data, error } = await admin.from("monitors").update(updates).eq("id", monitorId).select("*").maybeSingle();
  if (error) return errorJson(error.message, 500, "MONITOR_UPDATE_FAILED");
  if (!data) return errorJson("Monitor not found", 404, "NOT_FOUND");
  return successJson(data);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ monitorId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { monitorId } = await context.params;
  const access = await getMonitorWithAccess(auth, monitorId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();

  const admin = createAdminClient();
  const { error } = await admin.from("monitors").delete().eq("id", monitorId);
  if (error) return errorJson(error.message, 500, "MONITOR_DELETE_FAILED");
  return successJson({ deleted: true });
}
