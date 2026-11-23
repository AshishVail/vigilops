import type { SecurityScan, SecurityFinding } from "@/lib/types/security";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function FindingsTable({ scan }: { scan: SecurityScan }) {
  const findings = Array.isArray(scan.findings) ? scan.findings as SecurityFinding[] : [];
  return (
    <div className="rounded-xl border border-[#1F2633] bg-[#0E121A]">
      <Table>
        <TableHeader><TableRow><TableHead>Severity</TableHead><TableHead>Finding</TableHead><TableHead>Recommendation</TableHead></TableRow></TableHeader>
        <TableBody>{findings.map((finding)=>(
          <TableRow key={finding.code}>
            <TableCell><Badge variant={finding.severity==="high"?"danger":finding.severity==="medium"?"warning":"default"}>{finding.severity}</Badge></TableCell>
            <TableCell><p className="text-sm text-slate-300">{finding.title}</p><p className="mt-1 max-w-md text-xs text-slate-500">{finding.description}</p></TableCell>
            <TableCell className="max-w-md text-xs text-slate-400">{finding.recommendation}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      {findings.length===0&&<p className="py-10 text-center text-sm text-slate-500">No security findings.</p>}
    </div>
  );
}
