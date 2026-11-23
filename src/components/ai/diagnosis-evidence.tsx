import { CodeBlock } from "@/components/ui/code-block";
import type { StructuredDiagnosis } from "@/hooks/use-ai-diagnosis";

export function DiagnosisEvidence({ diagnosis }: { diagnosis: StructuredDiagnosis | null }) {
  if (!diagnosis) {
    return <div className="rounded-xl border border-dashed border-[#1F2633] p-8 text-center text-sm text-slate-600">No redacted evidence selected.</div>;
  }
  return (
    <section className="space-y-3 rounded-xl border border-[#1F2633] bg-[#0E121A] p-5">
      <h2 className="text-sm font-semibold">Redacted evidence</h2>
      <CodeBlock>{JSON.stringify({ evidence: diagnosis.evidence, likelyCauses: diagnosis.likelyCauses }, null, 2)}</CodeBlock>
    </section>
  );
}
