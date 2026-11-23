"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiDiagnosis, DiagnosisContext } from "@/lib/types/ai";

export type StructuredDiagnosis = {
  rootCause: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendedFix: string;
  confidence: number;
  evidence: string[];
  likelyCauses: string[];
  actionSteps: string[];
  model: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useAiHistory(projectId: string | null) {
  return useQuery({
    queryKey: ["ai-diagnoses", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/ai/diagnose?projectId=${encodeURIComponent(projectId ?? "")}`, { cache: "no-store" });
      return readJson<AiDiagnosis[]>(response);
    },
  });
}

export function useAiDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { context: DiagnosisContext; referenceId: string }) => {
      const response = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<{ diagnosis: StructuredDiagnosis; record: AiDiagnosis }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-diagnoses"] });
    },
  });
}
