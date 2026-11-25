"use client";

import type { NormalizedLog } from "@/lib/logs/normalize";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RequestIdCopy } from "@/components/logs/request-id-copy";

export function LogTable({ logs, onSelect }: { logs: NormalizedLog[]; onSelect: (log: NormalizedLog) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Source</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead><TableHead>Latency</TableHead><TableHead>Request ID</TableHead></TableRow></TableHeader>
        <TableBody>{logs.map((log)=><TableRow key={log.id} className="cursor-pointer" ><TableCell className="font-mono text-[11px]" onClick={()=>onSelect(log)}>{new Date(log.timestamp).toLocaleString()}</TableCell><TableCell onClick={()=>onSelect(log)}><Badge variant={log.source==="api"?"violet":"default"}>{log.source}</Badge></TableCell><TableCell onClick={()=>onSelect(log)} className="max-w-[220px] truncate">{log.service}</TableCell><TableCell onClick={()=>onSelect(log)}><Badge variant={log.level==="success"?"success":log.level==="error"?"danger":log.level==="warning"?"warning":"default"}>{log.statusCode ?? log.level}</Badge></TableCell><TableCell onClick={()=>onSelect(log)} className="font-mono text-xs">{log.latencyMs !== null ? `${log.latencyMs} ms` : "—"}</TableCell><TableCell><RequestIdCopy requestId={log.requestId}/></TableCell></TableRow>)}</TableBody>
      </Table>
      {logs.length===0&&<p className="py-10 text-center text-sm text-slate-600">No logs match the current filters.</p>}
    </div>
  );
}
