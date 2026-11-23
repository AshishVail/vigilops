import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { logFilterSchema } from "@/lib/validations/pagination";
import { queryNormalizedLogs } from "@/lib/logs/query";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();

  const parsed = logFilterSchema.safeParse({
    projectId: request.nextUrl.searchParams.get("projectId"),
    service: request.nextUrl.searchParams.get("service") ?? undefined,
    statusGroup: request.nextUrl.searchParams.get("statusGroup") ?? undefined,
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
    requestId: request.nextUrl.searchParams.get("requestId") ?? undefined,
    cursor: request.nextUrl.searchParams.get("cursor") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return errorJson("Invalid log filters", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", parsed.data.projectId)
    .maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership) return forbiddenJson();

  try {
    const result = await queryNormalizedLogs(auth.supabase, parsed.data);
    return successJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Unable to query logs", 500, "LOG_QUERY_FAILED");
  }
}
