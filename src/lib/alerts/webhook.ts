import "server-only";
import { validateSafeUrl } from "@/lib/network/url-safety";

export type AlertPayload = {
  event: "down" | "recovered" | "test";
  monitorName: string;
  monitorUrl?: string;
  incidentId?: string;
  message: string;
  timestamp: string;
  status?: "down" | "operating";
};

export async function sendWebhook(
  channelType: "discord" | "slack" | "generic",
  destination: string,
  payload: AlertPayload,
) {
  await validateSafeUrl(destination);
  let body: unknown;
  if (channelType === "discord") {
    body = {
      username: "VigilOps",
      embeds: [{
        title: payload.event === "test" ? "VigilOps test alert" : `${payload.monitorName}: ${payload.event === "down" ? "Service down" : "Service recovered"}`,
        description: payload.message,
        color: payload.event === "down" ? 0xf43f5e : payload.event === "recovered" ? 0x10b981 : 0x7c3aed,
        fields: [
          ...(payload.monitorUrl ? [{ name: "Target", value: payload.monitorUrl }] : []),
          ...(payload.incidentId ? [{ name: "Incident", value: payload.incidentId }] : []),
        ],
        timestamp: payload.timestamp,
      }],
    };
  } else if (channelType === "slack") {
    body = {
      text: `*VigilOps ${payload.event === "test" ? "test alert" : payload.event}*\n${payload.message}`,
      blocks: [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*VigilOps ${payload.event === "test" ? "test alert" : payload.event}*\n${payload.message}`,
        },
      }],
    };
  } else {
    body = payload;
  }

  const response = await fetch(destination, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status} ${response.statusText}`);
  }
  return { status: response.status };
}
