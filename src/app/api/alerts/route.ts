import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { alertChannelSchema } from "@/lib/validations/alert";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/alerts/encryption";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return errorJson("workspaceId is required", 400, "VALIDATION_ERROR");
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return forbiddenJson();

  const { data, error } = await auth.supabase.from("alert_channels").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) return errorJson(error.message, 500, "ALERT_LIST_FAILED");
  return successJson((data ?? []).map((channel) => ({ ...channel, destination: channel.type === "email" ? channel.destination : "[encrypted]" })));
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = alertChannelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson(parsed.error.issues[0]?.message ?? "Invalid alert channel", 400, "VALIDATION_ERROR");

  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", parsed.data.workspaceId).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  let encryptedSecret: string | null = null;
  if (parsed.data.type !== "email") {
    try {
      encryptedSecret = encryptSecret(parsed.data.destination);
    } catch (error) {
      return errorJson(error instanceof Error ? error.message : "Unable to protect alert destination", 400, "ALERT_SECRET_ERROR");
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("alert_channels").insert({
    workspace_id: parsed.data.workspaceId,
    project_id: parsed.data.projectId ?? null,
    type: parsed.data.type,
    name: parsed.data.name,
    destination: parsed.data.type === "email" ? parsed.data.destination : "[encrypted]",
    encrypted_secret: encryptedSecret,
    is_active: parsed.data.isActive,
    on_down: parsed.data.onDown,
    on_recovery: parsed.data.onRecovery,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "ALERT_CREATE_FAILED");
  return successJson({ ...data, destination: data.type === "email" ? data.destination : "[encrypted]" }, { status: 201 });
}
