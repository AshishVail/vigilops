"use client";

import type { PingLog } from "@/lib/types/monitor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function PingHistory({ logs }: { logs: PingLog[] }) {
  return (
    <div className="rounded-xl border border-[#1F2633] bg-[#0E121A]">
      <Table><TableHeader><TableRow><TableHead>Checked</TableHead><TableHead>Status</TableHead><TableHead>HTTP</TableHead><TableHead>Latency</TableHead><TableHead>Size</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
      <TableBody>{logs.map((log)=><TableRow key={log.id}><TableCell className="font-mono text-xs">{new Date(log.checked_at).toLocaleString()}</TableCell><TableCell><Badge variant={log.status==="success"?"success":log.status==="timeout"?"warning":"danger"}>{log.status}</Badge></TableCell><TableCell className="font-mono">{log.http_status ?? "—"}</TableCell><TableCell className="font-mono">{log.latency_ms} ms</TableCell><TableCell className="font-mono">{log.payload_size_bytes ?? 0} B</TableCell><TableCell className="max-w-[260px] truncate text-slate-500">{log.error_message ?? "—"}</TableCell></TableRow>)}</TableBody></Table>
      {logs.length===0&&<p className="py-10 text-center text-sm text-slate-500">No ping history yet.</p>}
    </div>
  );
}
