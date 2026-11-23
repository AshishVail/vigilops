import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createIncidentSchema } from "@/lib/validations/incident";
import { incidentStatusSchema } from "@/lib/validations/incident";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!projectId && !workspaceId) return errorJson("projectId or workspaceId is required", 400, "VALIDATION_ERROR");

  let projectIds: string[] = [];
  if (projectId) {
    const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
    if (!project) return forbiddenJson();
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    projectIds = [projectId];
  } else if (workspaceId) {
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    const { data: projects } = await auth.supabase.from("projects").select("id").eq("workspace_id", workspaceId);
    projectIds = (projects ?? []).map((project) => project.id);
  }

  let query = auth.supabase.from("incidents").select("*").order("started_at", { ascending: false }).limit(100);
  query = projectIds.length
    ? query.in("project_id", projectIds)
    : query.in("project_id", ["00000000-0000-0000-0000-000000000000"]);
  const status = request.nextUrl.searchParams.get("status");
  if (status) {
    const parsedStatus = incidentStatusSchema.safeParse(status);
    if (!parsedStatus.success) return errorJson("Invalid incident status", 400, "VALIDATION_ERROR");
    query = query.eq("status", parsedStatus.data);
  }

  const { data, error } = await query;
  if (error) return errorJson(error.message, 500, "INCIDENT_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = createIncidentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid incident data", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", parsed.data.projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const admin = createAdminClient();
  const { data: incident, error } = await admin.from("incidents").insert({
    project_id: parsed.data.projectId,
    monitor_id: parsed.data.monitorId ?? null,
    title: parsed.data.title,
    summary: parsed.data.summary ?? null,
    severity: parsed.data.severity,
    status: "investigating",
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "INCIDENT_CREATE_FAILED");

  await admin.from("incident_updates").insert({
    incident_id: incident.id,
    previous_status: null,
    new_status: "investigating",
    message: "Incident created.",
    created_by: auth.user.id,
  });
  await admin.from("activity_events").insert({
    workspace_id: project.workspace_id,
    project_id: parsed.data.projectId,
    type: "incident_created",
    title: incident.title,
    metadata: { incidentId: incident.id, severity: incident.severity },
    actor_id: auth.user.id,
  });
  return successJson(incident, { status: 201 });
}
