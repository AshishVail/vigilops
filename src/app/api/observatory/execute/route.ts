import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeObservatoryRequest } from "@/lib/observatory/executor";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import type { Json } from "@/lib/types/database";

const executeSchema = z.object({
  projectId: z.string().uuid(),
  requestId: z.string().uuid().optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  url: z.string().url(),
  queryParams: z.array(z.object({ key: z.string(), value: z.string(), enabled: z.boolean().default(true) })).max(100).default([]),
  headers: z.record(z.string(), z.string()).default({}),
  auth: z.union([
    z.object({ type: z.literal("none") }),
    z.object({ type: z.literal("bearer"), token: z.string().max(8192) }),
    z.object({ type: z.literal("api_key"), headerName: z.string().min(1).max(100), value: z.string().max(8192) }),
  ]).default({ type: "none" }),
  body: z.union([z.string(), z.record(z.string(), z.unknown()), z.array(z.unknown()), z.null()]).optional(),
  timeoutMs: z.number().int().min(1000).max(10000).default(10000),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = executeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid Observatory request", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", parsed.data.projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const result = await executeObservatoryRequest(parsed.data);
  const admin = createAdminClient();
  const { data: run, error } = await admin.from("api_runs").insert({
    request_id: parsed.data.requestId ?? null,
    project_id: parsed.data.projectId,
    request_id_header: result.requestId,
    method: parsed.data.method,
    url: parsed.data.url,
    http_status: result.status || null,
    latency_ms: result.latencyMs,
    payload_size_bytes: result.payloadSizeBytes,
    request_headers: parsed.data.headers,
    response_headers: result.responseHeaders,
    response_body: result.body as Json | null,
    error_message: result.error ?? null,
    executed_by: auth.user.id,
  }).select("*").single();

  if (error) return errorJson(error.message, 500, "OBSERVATORY_HISTORY_FAILED");
  return successJson({ run, response: result });
}
