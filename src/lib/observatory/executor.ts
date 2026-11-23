import "server-only";
import { performance } from "node:perf_hooks";
import { validateSafeUrl } from "@/lib/network/url-safety";
import { MAX_RESPONSE_BODY_BYTES, readLimitedResponse } from "@/lib/network/response-limits";

export type ObservatoryMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type ObservatoryExecutionInput = {
  method: ObservatoryMethod;
  url: string;
  queryParams?: Array<{ key: string; value: string; enabled: boolean }>;
  headers?: Record<string, string>;
  auth?: { type: "none" } | { type: "bearer"; token: string } | { type: "api_key"; headerName: string; value: string };
  body?: string | Record<string, unknown> | unknown[] | null;
  timeoutMs?: number;
};

export type ObservatoryExecutionResult = {
  requestId: string;
  status: number;
  statusText: string;
  latencyMs: number;
  payloadSizeBytes: number;
  responseHeaders: Record<string, string>;
  body: unknown;
  rawBody: string;
  truncated: boolean;
  timing: { ttfbMs: number; downloadMs: number; totalMs: number };
  error?: string;
};

export async function executeObservatoryRequest(input: ObservatoryExecutionInput): Promise<ObservatoryExecutionResult> {
  const requestId = crypto.randomUUID();
  const started = performance.now();
  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    return { requestId, status: 0, statusText: "Invalid URL", latencyMs: 0, payloadSizeBytes: 0, responseHeaders: {}, body: null, rawBody: "", truncated: false, timing: { ttfbMs: 0, downloadMs: 0, totalMs: 0 }, error: "Invalid URL" };
  }

  for (const param of input.queryParams ?? []) {
    if (param.enabled && param.key.trim()) url.searchParams.append(param.key.trim(), param.value);
  }

  try {
    await validateSafeUrl(url.toString());
  } catch (error) {
    const elapsed = Math.round(performance.now() - started);
    return { requestId, status: 0, statusText: "Blocked", latencyMs: elapsed, payloadSizeBytes: 0, responseHeaders: {}, body: null, rawBody: "", truncated: false, timing: { ttfbMs: elapsed, downloadMs: 0, totalMs: elapsed }, error: error instanceof Error ? error.message : "Target blocked" };
  }

  const headers = { ...(input.headers ?? {}) };
  if (input.auth?.type === "bearer") headers.Authorization = `Bearer ${input.auth.token}`;
  if (input.auth?.type === "api_key") headers[input.auth.headerName] = input.auth.value;

  let serializedBody: string | undefined;
  if (input.body !== undefined && input.body !== null && input.method !== "GET" && input.method !== "HEAD") {
    serializedBody = typeof input.body === "string" ? input.body : JSON.stringify(input.body);
    if (!Object.keys(headers).some((name) => name.toLowerCase() === "content-type")) {
      headers["Content-Type"] = typeof input.body === "string" ? "text/plain" : "application/json";
    }
  }

  const timeoutMs = Math.min(10000, Math.max(1000, input.timeoutMs ?? 10000));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: input.method,
      headers,
      body: serializedBody,
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    const ttfbMs = Math.round(performance.now() - started);
    const limited = await readLimitedResponse(response, MAX_RESPONSE_BODY_BYTES);
    const totalMs = Math.round(performance.now() - started);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, name) => { responseHeaders[name] = value; });

    let parsedBody: unknown = null;
    if (limited.text) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("json")) {
        try { parsedBody = JSON.parse(limited.text); } catch { parsedBody = limited.text; }
      } else {
        parsedBody = limited.text;
      }
    }

    return {
      requestId,
      status: response.status,
      statusText: response.statusText,
      latencyMs: totalMs,
      payloadSizeBytes: limited.sizeBytes,
      responseHeaders,
      body: parsedBody,
      rawBody: limited.text,
      truncated: limited.truncated,
      timing: { ttfbMs, downloadMs: Math.max(0, totalMs - ttfbMs), totalMs },
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - started);
    const timedOut = controller.signal.aborted;
    return {
      requestId,
      status: 0,
      statusText: timedOut ? "Timeout" : "Network error",
      latencyMs: elapsed,
      payloadSizeBytes: 0,
      responseHeaders: {},
      body: null,
      rawBody: "",
      truncated: false,
      timing: { ttfbMs: elapsed, downloadMs: 0, totalMs: elapsed },
      error: timedOut ? "Request timed out" : error instanceof Error ? error.message : "Request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
