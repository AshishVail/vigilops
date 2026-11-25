"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { useAiHistory, type StructuredDiagnosis } from "@/hooks/use-ai-diagnosis";
import { DiagnoseButton } from "@/components/ai/diagnose-button";
import { DiagnosisPanel } from "@/components/ai/diagnosis-panel";
import { DiagnosisEvidence } from "@/components/ai/diagnosis-evidence";
import { DiagnosisHistory } from "@/components/ai/diagnosis-history";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { DiagnosisContext } from "@/lib/types/ai";

export default function AiDoctorPage() {
  const workspaceId = useWorkspaceStore((state)=>state.workspaceId);
  const projectId = useWorkspaceStore((state)=>state.projectId);
  const projects = useProjects(workspaceId);
  const effectiveProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const history = useAiHistory(effectiveProjectId);
  const [context,setContext] = useState<DiagnosisContext>("incident");
  const [referenceId,setReferenceId] = useState("");
  const [diagnosis,setDiagnosis] = useState<StructuredDiagnosis|null>(null);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Groq powered</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">AI Incident Doctor</h1></div>
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="space-y-4">
              <div className="space-y-2"><Label>Evidence context</Label><Select value={context} onChange={(event)=>setContext(event.target.value as DiagnosisContext)}><option value="incident">Incident</option><option value="monitor">Monitor</option><option value="api">API run</option><option value="security">Security scan</option></Select></div>
              <div className="space-y-2"><Label>Reference ID</Label><Input value={referenceId} onChange={(event)=>setReferenceId(event.target.value)} placeholder="UUID" className="font-mono text-xs"/></div>
              {referenceId && <DiagnoseButton context={context} referenceId={referenceId} onDiagnosed={(result)=>setDiagnosis(result.diagnosis)}/>}
            </div>
          </section>
          <DiagnosisHistory records={history.data ?? []}/>
        </div>
        <div className="space-y-5"><DiagnosisPanel diagnosis={diagnosis}/><DiagnosisEvidence diagnosis={diagnosis}/></div>
      </div>
    </div>
  );
}
