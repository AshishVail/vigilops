import { Badge } from "@/components/ui/badge";

export function ResponseMeta({ status, latencyMs, sizeBytes }: { status: number; latencyMs: number; sizeBytes: number }) {
  const variant = status >= 200 && status < 300 ? "success" : status >= 400 ? "danger" : status >= 300 ? "warning" : "default";
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <Badge variant={variant}>{status || "Blocked"} {status >= 100 && status < 600 ? "" : ""}</Badge>
      <span className="font-mono text-slate-600">{latencyMs} ms</span>
      <span className="font-mono text-slate-600">{sizeBytes < 1024 ? `${sizeBytes} B` : `${(sizeBytes/1024).toFixed(1)} KB`}</span>
    </div>
  );
}
