import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createMonitorSchema } from "@/lib/validations/monitor";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSafeUrl } from "@/lib/network/url-safety";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!projectId && !workspaceId) return errorJson("projectId or workspaceId is required", 400, "VALIDATION_ERROR");

  let monitorQuery = auth.supabase.from("monitors").select("*").order("created_at", { ascending: false });
  if (projectId) {
    const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
    if (!project) return forbiddenJson();
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    monitorQuery = monitorQuery.eq("project_id", projectId);
  } else if (workspaceId) {
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    const { data: projects } = await auth.supabase.from("projects").select("id").eq("workspace_id", workspaceId);
    const projectIds = (projects ?? []).map((project) => project.id);
    monitorQuery = projectIds.length ? monitorQuery.in("project_id", projectIds) : monitorQuery.in("project_id", ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data, error } = await monitorQuery;
  if (error) return errorJson(error.message, 500, "MONITOR_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const body = await request.json().catch(() => null);
  const parsed = createMonitorSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid monitor data", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", parsed.data.projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const { count, error: countError } = await auth.supabase.from("monitors").select("id", { count: "exact", head: true }).in("project_id",
    ((await auth.supabase.from("projects").select("id").eq("workspace_id", project.workspace_id)).data ?? []).map((item) => item.id));
  if (countError) return errorJson(countError.message, 500, "MONITOR_COUNT_FAILED");
  if ((count ?? 0) >= 25) return errorJson("A workspace cannot contain more than 25 monitors", 409, "MONITOR_LIMIT_REACHED");

  try {
    await validateSafeUrl(parsed.data.url);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Invalid monitor URL", 400, "UNSAFE_URL");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("monitors").insert({
    project_id: parsed.data.projectId,
    name: parsed.data.name,
    url: parsed.data.url,
    method: parsed.data.method,
    interval_seconds: parsed.data.intervalSeconds,
    timeout_ms: parsed.data.timeoutMs,
    expected_status_codes: parsed.data.expectedStatusCodes,
    headers: parsed.data.headers,
    created_by: auth.user.id,
    next_check_at: new Date(Date.now() + parsed.data.intervalSeconds * 1000).toISOString(),
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "MONITOR_CREATE_FAILED");
  return successJson(data, { status: 201 });
}
