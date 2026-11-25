import { NextRequest } from "next/server";
import { requireWorkspace } from "@/lib/auth/require-workspace";
import { getDashboardData } from "@/lib/analytics/dashboard";
import { errorJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import type { DashboardRange } from "@/lib/types/dashboard";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const projectId = request.nextUrl.searchParams.get("projectId");
  const rangeParam = request.nextUrl.searchParams.get("range") ?? "24h";
  const range: DashboardRange =
    rangeParam === "7d" || rangeParam === "30d" ? rangeParam : "24h";

  if (!workspaceId) return errorJson("workspaceId is required", 400, "VALIDATION_ERROR");
  if (projectId && !/^[0-9a-f-]{36}$/i.test(projectId)) {
    return errorJson("Invalid projectId", 400, "VALIDATION_ERROR");
  }

  let access: Awaited<ReturnType<typeof requireWorkspace>>;
  try {
    access = await requireWorkspace(workspaceId);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Unable to verify workspace access", 500, "WORKSPACE_ACCESS_FAILED");
  }

  if (!access) {
    const auth = await import("@/lib/auth/require-auth").then((module) => module.requireAuth());
    if (!auth) return unauthorizedJson();
    return errorJson("Workspace access denied", 403, "FORBIDDEN");
  }

  try {
    const data = await getDashboardData(access.supabase, workspaceId, projectId, range);
    return successJson(data);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Unable to load dashboard", 500, "DASHBOARD_FAILED");
  }
}
