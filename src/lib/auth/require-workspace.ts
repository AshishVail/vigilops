import "server-only";
import type { WorkspaceRole } from "@/lib/types/database";
import { requireAuth } from "@/lib/auth/require-auth";

export type WorkspaceAccess = {
  workspaceId: string;
  role: WorkspaceRole;
  supabase: Awaited<ReturnType<typeof requireAuth>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never;
};

export async function requireWorkspace(workspaceId: string, minimumRole?: WorkspaceRole) {
  const auth = await requireAuth();
  if (!auth) return null;

  const roleHierarchy: Record<WorkspaceRole, number> = {
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4,
  };

  const { data: membership, error } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) throw new Error(`Workspace membership lookup failed: ${error.message}`);
  if (!membership) return null;
  if (minimumRole && roleHierarchy[membership.role] < roleHierarchy[minimumRole]) {
    return null;
  }

  return {
    workspaceId,
    role: membership.role,
    supabase: auth.supabase,
    user: auth.user,
  };
}

export async function requireWorkspaceBySlug(slug: string) {
  const auth = await requireAuth();
  if (!auth) return null;

  const { data: workspace, error } = await auth.supabase
    .from("workspaces")
    .select("id, slug, name, owner_id, is_demo, expires_at, public_status_enabled")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Workspace lookup failed: ${error.message}`);
  if (!workspace) return null;
  const access = await requireWorkspace(workspace.id);
  if (!access) return null;
  return { workspace, ...access };
}
