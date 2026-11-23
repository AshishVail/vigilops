import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateApiRequestSchema } from "@/lib/validations/collection";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import type { Json } from "@/lib/types/database";

async function accessRequest(auth: Awaited<ReturnType<typeof requireAuth>>, collectionId: string, requestId: string) {
  if (!auth) return null;
  const { data: saved } = await auth.supabase.from("api_requests").select("*, collection:api_collections(project:projects(workspace_id))").eq("id", requestId).eq("collection_id", collectionId).maybeSingle();
  if (!saved) return null;
  const collection = saved.collection as { project: { workspace_id: string } };
  const workspaceId = collection.project.workspace_id;
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { saved, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ collectionId: string; requestId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId, requestId } = await context.params;
  const access = await accessRequest(auth, collectionId, requestId);
  if (!access) return forbiddenJson();
  return successJson(access.saved);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ collectionId: string; requestId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId, requestId } = await context.params;
  const access = await accessRequest(auth, collectionId, requestId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const parsed = updateApiRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid saved request", 400, "VALIDATION_ERROR");
  const updates: {
    name?: string;
    method?: string;
    url?: string;
    query_params?: Json;
    headers?: Json;
    auth?: Json;
    body?: Json;
  } = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.method !== undefined) updates.method = parsed.data.method;
  if (parsed.data.url !== undefined) updates.url = parsed.data.url;
  if (parsed.data.queryParams !== undefined) updates.query_params = parsed.data.queryParams as Json;
  if (parsed.data.headers !== undefined) updates.headers = parsed.data.headers as Json;
  if (parsed.data.auth !== undefined) updates.auth = parsed.data.auth as Json;
  if (parsed.data.body !== undefined) updates.body = parsed.data.body as Json;
  const admin = createAdminClient();
  const { data, error } = await admin.from("api_requests").update(updates).eq("id", requestId).eq("collection_id", collectionId).select("*").single();
  if (error) return errorJson(error.message, 500, "REQUEST_UPDATE_FAILED");
  return successJson(data);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ collectionId: string; requestId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId, requestId } = await context.params;
  const access = await accessRequest(auth, collectionId, requestId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { error } = await admin.from("api_requests").delete().eq("id", requestId).eq("collection_id", collectionId);
  if (error) return errorJson(error.message, 500, "REQUEST_DELETE_FAILED");
  return successJson({ deleted: true });
}
