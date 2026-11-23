import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveApiRequestSchema } from "@/lib/validations/collection";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import type { Json } from "@/lib/types/database";

export async function GET(_request: NextRequest, context: { params: Promise<{ collectionId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId } = await context.params;
  const { data: collection } = await auth.supabase.from("api_collections").select("project:projects(workspace_id)").eq("id", collectionId).maybeSingle();
  if (!collection) return forbiddenJson();
  const project = collection.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return forbiddenJson();
  const { data, error } = await auth.supabase.from("api_requests").select("*").eq("collection_id", collectionId).order("created_at", { ascending: true });
  if (error) return errorJson(error.message, 500, "REQUEST_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest, context: { params: Promise<{ collectionId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId } = await context.params;
  const parsed = saveApiRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid saved request", 400, "VALIDATION_ERROR");
  const { data: collection } = await auth.supabase.from("api_collections").select("project:projects(workspace_id)").eq("id", collectionId).maybeSingle();
  if (!collection) return forbiddenJson();
  const project = collection.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { data, error } = await admin.from("api_requests").insert({
    collection_id: collectionId,
    name: parsed.data.name,
    method: parsed.data.method,
    url: parsed.data.url,
    query_params: parsed.data.queryParams,
    headers: parsed.data.headers,
    auth: parsed.data.auth,
    body: parsed.data.body as Json | undefined,
    created_by: auth.user.id,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "REQUEST_CREATE_FAILED");
  return successJson(data, { status: 201 });
}
