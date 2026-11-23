"use client";

import Link from "next/link";
import type { SecurityScan } from "@/lib/types/security";
import { Badge } from "@/components/ui/badge";

export function ScanHistory({ scans, onDelete }: { scans: SecurityScan[]; onDelete?: (scanId: string) => void }) {
  return (
    <div className="rounded-xl border border-[#1F2633] bg-[#0E121A]">
      {scans.map((scan)=>(
        <div key={scan.id} className="flex items-center justify-between gap-4 border-b border-[#1F2633] px-4 py-3 last:border-b-0">
          <Link href={`/security/${scan.id}`} className="min-w-0 flex-1"><p className="truncate font-mono text-xs text-slate-300">{scan.domain}</p><p className="mt-1 text-[11px] text-slate-600">{new Date(scan.scanned_at).toLocaleString()}</p></Link>
          <Badge variant={scan.security_score>=85?"success":scan.security_score>=65?"warning":"danger"}>{scan.grade} · {scan.security_score}</Badge>
          {onDelete&&<button onClick={()=>onDelete(scan.id)} className="text-xs text-slate-600 hover:text-rose-400">Delete</button>}
        </div>
      ))}
      {scans.length===0&&<p className="py-10 text-center text-sm text-slate-500">No security scans yet.</p>}
    </div>
  );
}
