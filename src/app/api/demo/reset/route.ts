import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resetDemoWorkspace } from "@/lib/demo/reset";
import { errorJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return unauthorizedJson();

    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return unauthorizedJson();

    const body = await request.json().catch(() => ({})) as { workspaceId?: unknown };
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : undefined;

    if (workspaceId) {
      const { data: membership } = await admin
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", authData.user.id)
        .maybeSingle();
      if (!membership) return errorJson("Demo workspace is not accessible", 403, "FORBIDDEN");
    }

    const seeded = await resetDemoWorkspace(authData.user.id, workspaceId);
    return successJson(seeded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset demo";
    return errorJson(message, 500, "DEMO_RESET_FAILED");
  }
}
