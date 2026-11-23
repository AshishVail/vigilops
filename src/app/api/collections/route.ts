import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCollectionSchema } from "@/lib/validations/collection";
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
  const { data, error } = await auth.supabase.from("api_collections").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
  if (error) return errorJson(error.message, 500, "COLLECTION_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = createCollectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid collection", 400, "VALIDATION_ERROR");
  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", parsed.data.projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { data, error } = await admin.from("api_collections").insert({
    project_id: parsed.data.projectId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    created_by: auth.user.id,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "COLLECTION_CREATE_FAILED");
  return successJson(data, { status: 201 });
}
