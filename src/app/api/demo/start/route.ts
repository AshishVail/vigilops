import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedDemoWorkspace } from "@/lib/demo/seed";
import { errorJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return unauthorizedJson();

    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return unauthorizedJson();

    const { data: memberships } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", authData.user.id);

    if (memberships?.length) {
      for (const membership of memberships) {
        const { data: workspace } = await admin
          .from("workspaces")
          .select("id, expires_at")
          .eq("id", membership.workspace_id)
          .eq("is_demo", true)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        if (workspace) {
          const { data: project } = await admin
            .from("projects")
            .select("id")
            .eq("workspace_id", workspace.id)
            .limit(1)
            .maybeSingle();
          return successJson({
            workspaceId: workspace.id,
            projectId: project?.id ?? null,
            expiresAt: workspace.expires_at,
            resettable: true,
          });
        }
      }
    }

    const seeded = await seedDemoWorkspace(authData.user.id);
    return successJson({ ...seeded, resettable: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start demo";
    return errorJson(message, 500, "DEMO_START_FAILED");
  }
}
