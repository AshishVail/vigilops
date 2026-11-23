import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateAlertChannelSchema } from "@/lib/validations/alert";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/alerts/encryption";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

async function accessChannel(auth: Awaited<ReturnType<typeof requireAuth>>, alertId: string) {
  if (!auth) return null;
  const { data: channel } = await auth.supabase.from("alert_channels").select("*").eq("id", alertId).maybeSingle();
  if (!channel) return null;
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", channel.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { channel, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ alertId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { alertId } = await context.params;
  const access = await accessChannel(auth, alertId);
  if (!access) return forbiddenJson();
  const channel = access.channel;
  return successJson({ ...channel, destination: channel.type === "email" ? channel.destination : "[encrypted]" });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ alertId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { alertId } = await context.params;
  const access = await accessChannel(auth, alertId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const parsed = updateAlertChannelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid alert channel data", 400, "VALIDATION_ERROR");

  const updates: {
    project_id?: string | null;
    name?: string;
    destination?: string;
    encrypted_secret?: string | null;
    is_active?: boolean;
    on_down?: boolean;
    on_recovery?: boolean;
  } = {};
  if (parsed.data.projectId !== undefined) updates.project_id = parsed.data.projectId;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;
  if (parsed.data.onDown !== undefined) updates.on_down = parsed.data.onDown;
  if (parsed.data.onRecovery !== undefined) updates.on_recovery = parsed.data.onRecovery;
  if (parsed.data.destination !== undefined) {
    if (access.channel.type === "email") updates.destination = parsed.data.destination;
    else {
      try {
        updates.encrypted_secret = encryptSecret(parsed.data.destination);
        updates.destination = "[encrypted]";
      } catch (error) {
        return errorJson(error instanceof Error ? error.message : "Unable to protect destination", 400, "ALERT_SECRET_ERROR");
      }
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("alert_channels").update(updates).eq("id", alertId).select("*").single();
  if (error) return errorJson(error.message, 500, "ALERT_UPDATE_FAILED");
  return successJson({ ...data, destination: data.type === "email" ? data.destination : "[encrypted]" });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ alertId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { alertId } = await context.params;
  const access = await accessChannel(auth, alertId);
  if (!access || !["owner", "admin"].includes(access.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { error } = await admin.from("alert_channels").delete().eq("id", alertId);
  if (error) return errorJson(error.message, 500, "ALERT_DELETE_FAILED");
  return successJson({ deleted: true });
}
