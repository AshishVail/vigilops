import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createProjectSchema } from "@/lib/validations/project";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return errorJson("workspaceId is required", 400, "VALIDATION_ERROR");

  const { data: membership, error: membershipError } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (membershipError) return errorJson(membershipError.message, 500, "PROJECT_ACCESS_FAILED");
  if (!membership) return forbiddenJson();

  const { data, error } = await auth.supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) return errorJson(error.message, 500, "PROJECT_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid project data", 400, "VALIDATION_ERROR");

  const { data: membership, error: membershipError } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", parsed.data.workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (membershipError) return errorJson(membershipError.message, 500, "PROJECT_ACCESS_FAILED");
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({
      workspace_id: parsed.data.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      color: parsed.data.color,
      public_status_enabled: parsed.data.publicStatusEnabled,
    })
    .select("*")
    .single();

  if (error) return errorJson(error.message, 500, "PROJECT_CREATE_FAILED");
  return successJson(data, { status: 201 });
}
