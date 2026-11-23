export type NormalizedLog = {
  id: string;
  requestId: string | null;
  timestamp: string;
  source: "monitor" | "api" | "security" | "incident" | "alert";
  level: "info" | "success" | "warning" | "error";
  statusCode: number | null;
  url: string | null;
  service: string;
  latencyMs: number | null;
  payloadSizeBytes: number | null;
  message: string;
  details: Record<string, unknown>;
};
