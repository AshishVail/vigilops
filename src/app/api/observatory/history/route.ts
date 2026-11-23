import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) return errorJson("projectId is required", 400, "VALIDATION_ERROR");
  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return forbiddenJson();

  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 25)));
  const { data, error } = await auth.supabase.from("api_runs").select("*").eq("project_id", projectId).order("executed_at", { ascending: false }).limit(limit);
  if (error) return errorJson(error.message, 500, "OBSERVATORY_HISTORY_FAILED");
  return successJson(data ?? []);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) return errorJson("projectId is required", 400, "VALIDATION_ERROR");
  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const admin = createAdminClient();
  const { error } = await admin.from("api_runs").delete().eq("project_id", projectId);
  if (error) return errorJson(error.message, 500, "OBSERVATORY_HISTORY_FAILED");
  return successJson({ deleted: true });
}
