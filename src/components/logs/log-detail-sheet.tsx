"use client";

import type { NormalizedLog } from "@/lib/logs/normalize";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";

export function LogDetailSheet({ log, open, onOpenChange }: { log: NormalizedLog | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!log) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader><SheetTitle>{log.service}</SheetTitle></SheetHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2"><Badge variant={log.level==="success"?"success":log.level==="error"?"danger":log.level==="warning"?"warning":"default"}>{log.level}</Badge><Badge>{log.source}</Badge></div>
        <dl className="space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-slate-600">Timestamp</dt><dd className="font-mono text-slate-300">{new Date(log.timestamp).toLocaleString()}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Request ID</dt><dd className="break-all font-mono text-slate-300">{log.requestId ?? "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">URL</dt><dd className="max-w-[260px] truncate font-mono text-slate-300">{log.url ?? "—"}</dd></div></dl>
        <p className="text-sm text-slate-400">{log.message}</p>
        <CodeBlock>{JSON.stringify(log.details, null, 2)}</CodeBlock>
      </div>
    </Sheet>
  );
}
