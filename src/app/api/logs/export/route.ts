import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { logFilterSchema } from "@/lib/validations/pagination";
import { queryNormalizedLogs } from "@/lib/logs/query";
import { rowsToCsv } from "@/lib/utils/csv";
import { forbiddenJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";
  const parsed = logFilterSchema.safeParse({
    projectId: request.nextUrl.searchParams.get("projectId"),
    service: request.nextUrl.searchParams.get("service") ?? undefined,
    statusGroup: request.nextUrl.searchParams.get("statusGroup") ?? undefined,
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
    requestId: request.nextUrl.searchParams.get("requestId") ?? undefined,
    limit: 100,
  });
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid log export filters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  const result = await queryNormalizedLogs(auth.supabase, parsed.data);
  const filename = `vigilops-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
  if (format === "csv") {
    const csv = rowsToCsv(
      ["timestamp", "source", "level", "service", "status_code", "latency_ms", "request_id", "message"],
      result.items.map((log) => [
        log.timestamp,
        log.source,
        log.level,
        log.service,
        log.statusCode,
        log.latencyMs,
        log.requestId,
        log.message,
      ]),
    );
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }
  return new Response(JSON.stringify(result.items, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
