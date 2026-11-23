"use client";

import { Button } from "@/components/ui/button";
import { useAiDiagnosis } from "@/hooks/use-ai-diagnosis";
import type { DiagnosisContext } from "@/lib/types/ai";
import type { StructuredDiagnosis } from "@/hooks/use-ai-diagnosis";

export function DiagnoseButton({
  context,
  referenceId,
  onDiagnosed,
}: {
  context: DiagnosisContext;
  referenceId: string;
  onDiagnosed?: (result: { diagnosis: StructuredDiagnosis; record: import("@/lib/types/ai").AiDiagnosis }) => void;
}) {
  const diagnose = useAiDiagnosis();
  async function run() {
    const result = await diagnose.mutateAsync({ context, referenceId });
    onDiagnosed?.(result);
  }
  return (
    <Button variant="outline" disabled={diagnose.isPending} onClick={() => void run()}>
      {diagnose.isPending ? "Diagnosing..." : "Diagnose with AI"}
    </Button>
  );
}
