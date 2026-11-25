import { Badge } from "@/components/ui/badge";
import type { StructuredDiagnosis } from "@/hooks/use-ai-diagnosis";

export function DiagnosisPanel({ diagnosis }: { diagnosis: StructuredDiagnosis | null }) {
  if (!diagnosis) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Run a diagnosis to inspect root cause and remediation.</div>;
  }
  const severityVariant = diagnosis.severity === "critical" || diagnosis.severity === "high" ? "danger" : diagnosis.severity === "medium" ? "warning" : "success";
  return (
    <article className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-700">Incident Doctor</p><h2 className="mt-2 text-lg font-semibold">Diagnosis</h2></div><Badge variant={severityVariant}>{diagnosis.severity}</Badge></div>
      <dl className="mt-5 space-y-5">
        <div><dt className="text-xs text-slate-600">Root cause</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{diagnosis.rootCause}</dd></div>
        <div><dt className="text-xs text-slate-600">Concrete fix</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{diagnosis.recommendedFix}</dd></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-slate-600">Confidence</dt><dd className="mt-2 font-mono text-sm text-cyan-700">{Math.round(diagnosis.confidence * 100)}%</dd></div><div><dt className="text-xs text-slate-600">Model</dt><dd className="mt-2 font-mono text-xs text-slate-600">{diagnosis.model}</dd></div></div>
      </dl>
      {diagnosis.actionSteps.length > 0 && <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs text-slate-600">Action steps</p><ol className="mt-3 space-y-2">{diagnosis.actionSteps.map((step,index)=><li key={step} className="flex gap-3 text-sm text-slate-600"><span className="font-mono text-xs text-indigo-700">{index+1}</span>{step}</li>)}</ol></div>}
    </article>
  );
}
