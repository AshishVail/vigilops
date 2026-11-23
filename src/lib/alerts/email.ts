import "server-only";

export type EmailAlertPayload = {
  recipient: string;
  monitorName: string;
  event: "down" | "recovered" | "test";
  message: string;
};

export async function sendEmailAlert(payload: EmailAlertPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !from) {
    return { skipped: true, reason: "RESEND_API_KEY or ALERT_FROM_EMAIL is not configured" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const subject = payload.event === "test"
    ? "VigilOps test alert"
    : `${payload.monitorName} is ${payload.event === "down" ? "down" : "recovered"}`;
  const result = await resend.emails.send({
    from,
    to: [payload.recipient],
    subject,
    text: payload.message,
  });
  if (result.error) throw new Error(result.error.message);
  return { skipped: false, id: result.data?.id };
}
