"use client";

import { useState, type FormEvent } from "react";
import { createMonitorSchema } from "@/lib/validations/monitor";
import type { Monitor } from "@/lib/types/monitor";
import { useCreateMonitor, useUpdateMonitor } from "@/hooks/use-monitors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type MonitorFormProps = {
  projectId: string;
  monitor?: Monitor;
  onSaved?: (monitor: Monitor) => void;
};

export function MonitorForm({ projectId, monitor, onSaved }: MonitorFormProps) {
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();
  const [name, setName] = useState(monitor?.name ?? "");
  const [url, setUrl] = useState(monitor?.url ?? "");
  const [method, setMethod] = useState<"GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE">(monitor?.method as "GET" ?? "GET");
  const [intervalSeconds, setIntervalSeconds] = useState(monitor?.interval_seconds ?? 300);
  const [timeoutMs, setTimeoutMs] = useState(monitor?.timeout_ms ?? 10000);
  const [expectedStatusCodes, setExpectedStatusCodes] = useState((monitor?.expected_status_codes ?? [200]).join(", "));
  const [headers, setHeaders] = useState(JSON.stringify(monitor?.headers && typeof monitor.headers === "object" ? monitor.headers : {}, null, 2));
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let parsedHeaders: Record<string, string>;
    try {
      const value = JSON.parse(headers) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Headers must be a JSON object");
      parsedHeaders = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid headers");
      return;
    }
    const statusCodes = expectedStatusCodes.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value >= 100 && value <= 599);
    const input = { projectId, name, url, method, intervalSeconds, timeoutMs, expectedStatusCodes: statusCodes, headers: parsedHeaders };
    const parsed = createMonitorSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid monitor configuration");
      return;
    }
    try {
      const saved = monitor
        ? await updateMonitor.mutateAsync({ monitorId: monitor.id, name, url, method, intervalSeconds, timeoutMs, expectedStatusCodes: statusCodes, headers: parsedHeaders })
        : await createMonitor.mutateAsync({ ...parsed.data, headers: parsedHeaders });
      onSaved?.(saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save monitor");
    }
  }

  const pending = createMonitor.isPending || updateMonitor.isPending;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="monitor-name">Monitor name</Label><Input id="monitor-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Production API" required /></div>
        <div className="space-y-2"><Label htmlFor="monitor-method">Method</Label><Select id="monitor-method" value={method} onChange={(event) => setMethod(event.target.value as typeof method)}><option>GET</option><option>HEAD</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></Select></div>
      </div>
      <div className="space-y-2"><Label htmlFor="monitor-url">Target URL</Label><Input id="monitor-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/health" required /></div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="monitor-interval">Interval</Label><Select id="monitor-interval" value={String(intervalSeconds)} onChange={(event) => setIntervalSeconds(Number(event.target.value))}><option value="300">5 minutes</option><option value="600">10 minutes</option><option value="900">15 minutes</option><option value="1800">30 minutes</option><option value="3600">1 hour</option></Select></div>
        <div className="space-y-2"><Label htmlFor="monitor-timeout">Timeout</Label><Select id="monitor-timeout" value={String(timeoutMs)} onChange={(event) => setTimeoutMs(Number(event.target.value))}><option value="3000">3 seconds</option><option value="5000">5 seconds</option><option value="10000">10 seconds</option></Select></div>
        <div className="space-y-2"><Label htmlFor="monitor-statuses">Expected status codes</Label><Input id="monitor-statuses" value={expectedStatusCodes} onChange={(event) => setExpectedStatusCodes(event.target.value)} placeholder="200, 201, 204" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="monitor-headers">Custom headers (JSON)</Label><Textarea id="monitor-headers" value={headers} onChange={(event) => setHeaders(event.target.value)} className="min-h-28 font-mono text-xs" /></div>
      {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
      <div className="flex justify-end"><Button type="submit" disabled={pending}>{pending ? "Saving..." : monitor ? "Save monitor" : "Create monitor"}</Button></div>
    </form>
  );
}
