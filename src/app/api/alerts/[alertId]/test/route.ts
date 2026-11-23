import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { decryptSecret } from "@/lib/alerts/encryption";
import { sendWebhook } from "@/lib/alerts/webhook";
import { sendEmailAlert } from "@/lib/alerts/email";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function POST(_request: NextRequest, context: { params: Promise<{ alertId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { alertId } = await context.params;
  const { data: channel } = await auth.supabase.from("alert_channels").select("*").eq("id", alertId).maybeSingle();
  if (!channel) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", channel.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const timestamp = new Date().toISOString();
  const payload = {
    event: "test" as const,
    monitorName: "VigilOps",
    message: "This is a test alert from VigilOps.",
    timestamp,
  };

  let delivery: { status: "succeeded" | "skipped"; detail: string };
  try {
    if (channel.type === "email") {
      const result = await sendEmailAlert({ recipient: channel.destination, monitorName: "VigilOps", event: "test", message: payload.message });
      delivery = result.skipped
        ? { status: "skipped", detail: result.reason ?? "Email delivery is not configured" }
        : { status: "succeeded", detail: result.id ?? "Email queued" };
    } else {
      const destination = channel.encrypted_secret ? decryptSecret(channel.encrypted_secret) : channel.destination;
      await sendWebhook(channel.type === "discord" ? "discord" : "slack", destination, payload);
      delivery = { status: "succeeded", detail: "Webhook delivered" };
    }
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Test delivery failed", 502, "ALERT_TEST_FAILED");
  }

  await auth.supabase.from("alert_deliveries").insert({
    incident_id: null,
    channel_id: channel.id,
    event_type: "test",
    status: delivery.status === "succeeded" ? "succeeded" : "failed",
    payload: { event: "test", timestamp, detail: delivery.detail },
    error_message: delivery.status === "skipped" ? delivery.detail : null,
    delivered_at: delivery.status === "succeeded" ? timestamp : null,
  });
  return successJson(delivery);
}
