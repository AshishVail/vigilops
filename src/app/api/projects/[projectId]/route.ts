import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateProjectSchema } from "@/lib/validations/project";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { projectId } = await context.params;

  const { data: project, error } = await auth.supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) return errorJson(error.message, 500, "PROJECT_LOAD_FAILED");
  if (!project) return errorJson("Project not found", 404, "NOT_FOUND");

  const { data: membership } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership) return forbiddenJson();
  return successJson(project);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { projectId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid project data", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return errorJson("Project not found", 404, "NOT_FOUND");

  const { data: membership } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const updates: {
    name?: string;
    description?: string | null;
    color?: string;
    public_status_enabled?: boolean;
  } = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.color !== undefined) updates.color = parsed.data.color;
  if (parsed.data.publicStatusEnabled !== undefined) updates.public_status_enabled = parsed.data.publicStatusEnabled;
  if (Object.keys(updates).length === 0) return errorJson("No project fields to update", 400, "VALIDATION_ERROR");

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select("*")
    .maybeSingle();
  if (error) return errorJson(error.message, 500, "PROJECT_UPDATE_FAILED");
  if (!updated) return errorJson("Project not found", 404, "NOT_FOUND");
  return successJson(updated);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { projectId } = await context.params;

  const { data: project } = await auth.supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return errorJson("Project not found", 404, "NOT_FOUND");

  const { data: membership } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) return forbiddenJson();

  const admin = createAdminClient();
  const { error } = await admin.from("projects").delete().eq("id", projectId);
  if (error) return errorJson(error.message, 500, "PROJECT_DELETE_FAILED");
  return successJson({ deleted: true });
}
