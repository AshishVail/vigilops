import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateWorkspaceSchema } from "@/lib/validations/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { workspaceId } = await context.params;

  const { data: membership, error: membershipError } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (membershipError) return errorJson(membershipError.message, 500, "WORKSPACE_ACCESS_FAILED");
  if (!membership) return forbiddenJson();

  const { data: workspace, error } = await auth.supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) return errorJson(error.message, 500, "WORKSPACE_LOAD_FAILED");
  if (!workspace) return errorJson("Workspace not found", 404, "NOT_FOUND");
  return successJson({ workspace, role: membership.role });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { workspaceId } = await context.params;

  const { data: membership, error: membershipError } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (membershipError) return errorJson(membershipError.message, 500, "WORKSPACE_ACCESS_FAILED");
  if (!membership || !["owner", "admin"].includes(membership.role)) return forbiddenJson();

  const body = await request.json().catch(() => null) as
    | { name?: string; slug?: string; publicStatusEnabled?: boolean }
    | { memberAction?: "invite" | "update_role" | "remove"; email?: string; role?: "admin" | "member" | "viewer"; userId?: string }
    | null;
  if (!body) return errorJson("Invalid request body", 400, "VALIDATION_ERROR");

  if ("memberAction" in body) {
    const admin = createAdminClient();
    if (body.memberAction === "invite") {
      if (!body.email) return errorJson("Email is required", 400, "VALIDATION_ERROR");
      const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
        redirectTo: new URL("/auth/callback", process.env.NEXT_PUBLIC_APP_URL ?? "https://vigilops.nexovent.tech").toString(),
      });
      if (error) return errorJson(error.message, 500, "MEMBER_INVITE_FAILED");

      const role = body.role ?? "member";
      if (!invite.user) return errorJson("Invitation was sent but no user record was returned", 500, "MEMBER_INVITE_FAILED");
      const { error: membershipInsertError } = await admin
        .from("workspace_members")
        .upsert({ workspace_id: workspaceId, user_id: invite.user.id, role }, { onConflict: "workspace_id,user_id" });
      if (membershipInsertError) return errorJson(membershipInsertError.message, 500, "MEMBER_ADD_FAILED");
      return successJson({ invited: true, email: body.email, role });
    }

    if (body.memberAction === "update_role") {
      if (!body.userId || !body.role) return errorJson("User ID and role are required", 400, "VALIDATION_ERROR");
      if (body.userId === auth.user.id) return errorJson("Use the owner account to change your own role", 409, "MEMBER_ROLE_INVALID");
      const { error } = await admin
        .from("workspace_members")
        .update({ role: body.role })
        .eq("workspace_id", workspaceId)
        .eq("user_id", body.userId);
      if (error) return errorJson(error.message, 500, "MEMBER_ROLE_UPDATE_FAILED");
      return successJson({ updated: true, userId: body.userId, role: body.role });
    }

    if (body.memberAction === "remove") {
      if (!body.userId) return errorJson("User ID is required", 400, "VALIDATION_ERROR");
      if (body.userId === auth.user.id) return errorJson("Owners cannot remove themselves", 409, "MEMBER_REMOVE_INVALID");
      const { error } = await admin
        .from("workspace_members")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("user_id", body.userId);
      if (error) return errorJson(error.message, 500, "MEMBER_REMOVE_FAILED");
      return successJson({ removed: true, userId: body.userId });
    }
  }

  const parsed = updateWorkspaceSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid workspace data", 400, "VALIDATION_ERROR");

  const updates: {
    name?: string;
    slug?: string;
    public_status_enabled?: boolean;
  } = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug;
  if (parsed.data.publicStatusEnabled !== undefined) updates.public_status_enabled = parsed.data.publicStatusEnabled;
  if (Object.keys(updates).length === 0) return errorJson("No workspace fields to update", 400, "VALIDATION_ERROR");

  const admin = createAdminClient();
  const { data: workspace, error } = await admin
    .from("workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .select("*")
    .maybeSingle();
  if (error) return errorJson(error.message, 500, "WORKSPACE_UPDATE_FAILED");
  if (!workspace) return errorJson("Workspace not found", 404, "NOT_FOUND");
  return successJson(workspace);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> },
) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { workspaceId } = await context.params;

  const { data: membership, error: membershipError } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (membershipError) return errorJson(membershipError.message, 500, "WORKSPACE_ACCESS_FAILED");
  if (!membership || membership.role !== "owner") return forbiddenJson();

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
