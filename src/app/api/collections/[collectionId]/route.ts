import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateCollectionSchema } from "@/lib/validations/collection";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

async function accessCollection(auth: Awaited<ReturnType<typeof requireAuth>>, collectionId: string) {
  if (!auth) return null;
  const { data: collection } = await auth.supabase.from("api_collections").select("*, project:projects(workspace_id)").eq("id", collectionId).maybeSingle();
  if (!collection) return null;
  const project = collection.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { collection, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ collectionId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId } = await context.params;
  const access = await accessCollection(auth, collectionId);
  if (!access) return forbiddenJson();
  const { data: requests } = await auth.supabase.from("api_requests").select("*").eq("collection_id", collectionId).order("created_at", { ascending: true });
  return successJson({ collection: access.collection, requests: requests ?? [] });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ collectionId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId } = await context.params;
  const access = await accessCollection(auth, collectionId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const parsed = updateCollectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid collection", 400, "VALIDATION_ERROR");
  const admin = createAdminClient();
  const updates: { name?: string; description?: string | null } = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  const { data, error } = await admin.from("api_collections").update(updates).eq("id", collectionId).select("*").single();
  if (error) return errorJson(error.message, 500, "COLLECTION_UPDATE_FAILED");
  return successJson(data);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ collectionId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { collectionId } = await context.params;
  const access = await accessCollection(auth, collectionId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { error } = await admin.from("api_collections").delete().eq("id", collectionId);
  if (error) return errorJson(error.message, 500, "COLLECTION_DELETE_FAILED");
  return successJson({ deleted: true });
}
