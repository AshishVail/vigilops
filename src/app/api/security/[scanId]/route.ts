import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

async function accessScan(auth: Awaited<ReturnType<typeof requireAuth>>, scanId: string) {
  if (!auth) return null;
  const { data: scan } = await auth.supabase.from("security_scans").select("*, project:projects(workspace_id)").eq("id", scanId).maybeSingle();
  if (!scan) return null;
  const project = scan.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { scan, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ scanId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { scanId } = await context.params;
  const access = await accessScan(auth, scanId);
  if (!access) return forbiddenJson();
  return successJson(access.scan);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ scanId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { scanId } = await context.params;
  const access = await accessScan(auth, scanId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { error } = await admin.from("security_scans").delete().eq("id", scanId);
  if (error) return errorJson(error.message, 500, "SECURITY_SCAN_DELETE_FAILED");
  return successJson({ deleted: true });
}
