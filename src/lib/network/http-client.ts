import "server-only";
import { performance } from "node:perf_hooks";
import { validateSafeUrl } from "@/lib/network/url-safety";
import { readLimitedResponse, MAX_RESPONSE_BODY_BYTES } from "@/lib/network/response-limits";
import type { HttpTiming } from "@/lib/network/timing";

export type LiveHttpResult = {
  status: number;
  statusText: string;
  latencyMs: number;
  payloadSizeBytes: number;
  responseHeaders: Record<string, string>;
  body: string;
  truncated: boolean;
  timing: HttpTiming;
  error?: string;
};

export async function runLiveHttpCheck(
  inputUrl: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {},
): Promise<LiveHttpResult> {
  const start = performance.now();
  const timeoutMs = Math.min(10000, Math.max(1000, options.timeoutMs ?? 10000));
  let url: URL;
  try {
    url = await validateSafeUrl(inputUrl);
  } catch (error) {
    return {
      status: 0,
      statusText: "Network error",
      latencyMs: Math.round(performance.now() - start),
      payloadSizeBytes: 0,
      responseHeaders: {},
      body: "",
      truncated: false,
      timing: { dnsMs: 0, connectMs: 0, ttfbMs: 0, downloadMs: 0, totalMs: Math.round(performance.now() - start) },
      error: error instanceof Error ? error.message : "Invalid target",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let redirectedUrl = url;

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: options.headers,
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    const ttfb = Math.round(performance.now() - start);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        redirectedUrl = new URL(location, url);
        await validateSafeUrl(redirectedUrl.toString());
        if (redirectedUrl.protocol !== "http:" && redirectedUrl.protocol !== "https:") {
          throw new Error("Redirect target is not HTTP or HTTPS");
        }
        const redirected = await fetch(redirectedUrl, {
          method: options.method ?? "GET",
          headers: options.headers,
          redirect: "manual",
          signal: controller.signal,
          cache: "no-store",
        });
        const limited = await readLimitedResponse(redirected, MAX_RESPONSE_BODY_BYTES);
        const total = Math.round(performance.now() - start);
        const headers: Record<string, string> = {};
        redirected.headers.forEach((value, key) => { headers[key] = value; });
        return {
          status: redirected.status,
          statusText: redirected.statusText,
          latencyMs: total,
          payloadSizeBytes: limited.sizeBytes,
          responseHeaders: headers,
          body: limited.text,
          truncated: limited.truncated,
          timing: { dnsMs: 0, connectMs: 0, ttfbMs: ttfb, downloadMs: Math.max(0, total - ttfb), totalMs: total },
        };
      }
    }

    const limited = await readLimitedResponse(response, MAX_RESPONSE_BODY_BYTES);
    const total = Math.round(performance.now() - start);
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => { headers[key] = value; });
    return {
      status: response.status,
      statusText: response.statusText,
      latencyMs: total,
      payloadSizeBytes: limited.sizeBytes,
      responseHeaders: headers,
      body: limited.text,
      truncated: limited.truncated,
      timing: { dnsMs: 0, connectMs: 0, ttfbMs: ttfb, downloadMs: Math.max(0, total - ttfb), totalMs: total },
    };
  } catch (error) {
    const total = Math.round(performance.now() - start);
    const timedOut = controller.signal.aborted;
    return {
      status: 0,
      statusText: timedOut ? "Timeout" : "Network error",
      latencyMs: total,
      payloadSizeBytes: 0,
      responseHeaders: {},
      body: "",
      truncated: false,
      timing: { dnsMs: 0, connectMs: 0, ttfbMs: 0, downloadMs: 0, totalMs: total },
      error: timedOut ? "Request timed out" : error instanceof Error ? error.message : "Network request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
