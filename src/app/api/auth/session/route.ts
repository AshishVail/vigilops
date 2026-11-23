import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { errorJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorizedJson();

    const { data: workspaces, error } = await auth.supabase
      .from("workspace_members")
      .select("role, workspace:workspaces(id, name, slug, owner_id, is_demo, expires_at, public_status_enabled)")
      .eq("user_id", auth.user.id);

    if (error) return errorJson(error.message, 500, "SESSION_WORKSPACES_FAILED");

    return successJson({
      user: {
        id: auth.user.id,
        email: auth.user.email,
        isAnonymous: auth.user.is_anonymous ?? false,
        metadata: auth.user.user_metadata,
      },
      workspaces: workspaces ?? [],
    });
  } catch {
    return errorJson("Unable to load session", 500, "SESSION_FAILED");
  }
}
