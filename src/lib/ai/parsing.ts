import { z } from "zod";
import type { GroqDiagnosisMessage } from "@/lib/ai/groq";

const diagnosisSchema = z.object({
  rootCause: z.string().trim().min(10).max(4000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  recommendedFix: z.string().trim().min(10).max(6000),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  likelyCauses: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
  actionSteps: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
});

function extractJson(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    }
    throw new Error("Diagnosis response did not contain valid JSON");
  }
}

export function parseDiagnosis(text: string): GroqDiagnosisMessage {
  const parsed = diagnosisSchema.safeParse(extractJson(text));
  if (!parsed.success) {
    return {
      rootCause: "The AI response was incomplete or could not be parsed safely.",
      severity: "medium",
      recommendedFix: "Inspect the original logs and incident evidence manually, then retry diagnosis.",
      confidence: 0,
      evidence: ["Structured AI output parsing failed"],
      likelyCauses: [],
      actionSteps: ["Review raw incident evidence", "Retry AI diagnosis"],
    };
  }
  return parsed.data;
}
