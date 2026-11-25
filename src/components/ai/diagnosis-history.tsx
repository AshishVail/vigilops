import type { AiDiagnosis } from "@/lib/types/ai";
import { Badge } from "@/components/ui/badge";

export function DiagnosisHistory({ records }: { records: AiDiagnosis[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Diagnosis history</h2>
      <div className="mt-4 space-y-2">
        {records.map((record)=>(
          <article key={record.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3"><p className="text-sm text-slate-600">{record.root_cause}</p><Badge variant={record.severity==="critical"||record.severity==="high"?"danger":record.severity==="medium"?"warning":"success"}>{record.severity}</Badge></div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">{record.model} · {new Date(record.created_at).toLocaleString()}</p>
          </article>
        ))}
        {records.length===0&&<p className="py-8 text-center text-sm text-slate-600">No diagnoses have been saved.</p>}
      </div>
    </section>
  );
}
