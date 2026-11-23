import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest, context: { params: Promise<{ monitorId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { monitorId } = await context.params;
  const { data: monitor } = await auth.supabase.from("monitors").select("project:projects(workspace_id)").eq("id", monitorId).maybeSingle();
  if (!monitor) return forbiddenJson();
  const project = monitor.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return forbiddenJson();

  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 25)));
  const cursor = request.nextUrl.searchParams.get("cursor");
  let query = auth.supabase.from("ping_logs").select("*").eq("monitor_id", monitorId).order("checked_at", { ascending: false }).limit(limit + 1);
  if (cursor) query = query.lt("checked_at", cursor);
  const { data, error } = await query;
  if (error) return errorJson(error.message, 500, "PING_HISTORY_FAILED");
  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return successJson({ items, nextCursor: hasMore ? items[items.length - 1]?.checked_at ?? null : null });
}
