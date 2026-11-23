import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";
import { decryptSecret } from "@/lib/alerts/encryption";
import { sendWebhook, type AlertPayload } from "@/lib/alerts/webhook";
import { sendEmailAlert } from "@/lib/alerts/email";

export type AlertEvent = "down" | "recovered" | "test";

export async function dispatchAlert(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  projectId: string | null,
  incidentId: string | null,
  payload: AlertPayload,
  event: AlertEvent,
) {
  let query = supabase
    .from("alert_channels")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);
  if (projectId) query = query.or(`project_id.is.null,project_id.eq.${projectId}`);
  const { data: channels, error } = await query;
  if (error) throw new Error(error.message);

  const results: Array<{ channelId: string; status: "succeeded" | "failed"; error?: string }> = [];

  for (const channel of channels ?? []) {
    if (event === "down" && !channel.on_down) continue;
    if (event === "recovered" && !channel.on_recovery) continue;

    let status: "succeeded" | "failed" = "succeeded";
    let errorMessage: string | null = null;
    const auditPayload: Json = {
      event,
      monitorName: payload.monitorName,
      timestamp: payload.timestamp,
    };

    try {
      if (channel.type === "email") {
        const emailResult = await sendEmailAlert({
          recipient: channel.destination,
          monitorName: payload.monitorName,
          event,
          message: payload.message,
        });
        if (emailResult.skipped) {
          status = "failed";
          errorMessage = `Skipped: ${emailResult.reason ?? "Email delivery is not configured"}`;
        }
      } else {
        const destination = channel.encrypted_secret
          ? decryptSecret(channel.encrypted_secret)
          : channel.destination;
        await sendWebhook(
          channel.type === "discord" ? "discord" : channel.type === "slack" ? "slack" : "generic",
          destination,
          payload,
        );
      }
    } catch (error) {
      status = "failed";
      errorMessage = error instanceof Error ? error.message : "Delivery failed";
    }

    await supabase.from("alert_deliveries").insert({
      incident_id: incidentId,
      channel_id: channel.id,
      event_type: event,
      status,
      payload: auditPayload,
      error_message: errorMessage,
      delivered_at: status === "succeeded" ? new Date().toISOString() : null,
    });
    results.push({ channelId: channel.id, status, ...(errorMessage ? { error: errorMessage } : {}) });
  }

  return results;
}
