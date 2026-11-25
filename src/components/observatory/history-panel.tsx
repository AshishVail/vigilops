"use client";

import type { ApiRun } from "@/lib/types/observatory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HistoryPanel({ runs, onClear }: { runs: ApiRun[]; onClear: () => void }) {
  return (
    <aside className="border-l border-slate-200 bg-slate-50">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3"><p className="text-xs font-semibold">History</p><Button variant="ghost" size="sm" onClick={onClear}>Clear</Button></div>
      <div className="max-h-[640px] space-y-1 overflow-y-auto p-2">
        {runs.map((run)=>(
          <div key={run.id} className="rounded-lg border border-transparent p-2 hover:border-slate-200">
            <div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-violet-700">{run.method}</span><Badge variant={run.http_status && run.http_status>=200&&run.http_status<300?"success":run.http_status&&run.http_status>=400?"danger":"default"}>{run.http_status ?? "ERR"}</Badge></div>
            <p className="mt-1 truncate font-mono text-[11px] text-slate-600">{run.url}</p>
            <p className="mt-1 text-[10px] text-slate-600">{run.latency_ms ?? 0} ms · {new Date(run.executed_at).toLocaleTimeString()}</p>
          </div>
        ))}
        {runs.length===0&&<p className="py-12 text-center text-xs text-slate-600">No execution history</p>}
      </div>
    </aside>
  );
}
