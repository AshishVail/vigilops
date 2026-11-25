import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import { slugify } from "@/lib/utils/urls";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const { data, error } = await auth.supabase
    .from("workspace_members")
    .select("role, joined_at, workspace:workspaces(*)")
    .eq("user_id", auth.user.id)
    .order("joined_at", { ascending: false });

  if (error) return errorJson(error.message, 500, "WORKSPACE_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const body = await request.json().catch(() => null);
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson("Invalid workspace data", 400, "VALIDATION_ERROR");
  }

  const admin = createAdminClient();
  const baseSlug = parsed.data.slug ?? slugify(parsed.data.name);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      slug,
      owner_id: auth.user.id,
      public_status_enabled: parsed.data.publicStatusEnabled,
      is_demo: false,
      expires_at: null,
    })
    .select("*")
    .single();

  if (workspaceError || !workspace) {
    return errorJson(workspaceError?.message ?? "Unable to create workspace", 500, "WORKSPACE_CREATE_FAILED");
  }

  const { error: memberError } = await admin
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: auth.user.id, role: "owner" });

  if (memberError) {
    await admin.from("workspaces").delete().eq("id", workspace.id);
    return errorJson(memberError.message, 500, "WORKSPACE_MEMBERSHIP_FAILED");
  }

  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      name: "Core Platform",
      description: "Default production observability project.",
      color: "#6366F1",
      public_status_enabled: parsed.data.publicStatusEnabled,
    })
    .select("*")
    .single();

  if (projectError) {
    await admin.from("workspaces").delete().eq("id", workspace.id);
    return errorJson(projectError.message, 500, "DEFAULT_PROJECT_FAILED");
  }

  return successJson({ workspace, project, role: "owner" }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return errorJson("workspaceId is required", 400, "VALIDATION_ERROR");

  const access = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (access.error) return errorJson(access.error.message, 500, "WORKSPACE_ACCESS_FAILED");
  if (!access.data || access.data.role !== "owner") return forbiddenJson();

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("is_demo")
    .eq("id", workspaceId)
    .maybeSingle();

  if (workspace?.is_demo) {
    return errorJson("Demo workspaces must be reset or expire naturally", 409, "DEMO_WORKSPACE_PROTECTED");
  }

  const { error } = await admin.from("workspaces").delete().eq("id", workspaceId);
  if (error) return errorJson(error.message, 500, "WORKSPACE_DELETE_FAILED");
  return successJson({ deleted: true });
}
