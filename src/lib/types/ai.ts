import type { Database } from "@/lib/types/database";

export type AiDiagnosis = Database["public"]["Tables"]["ai_diagnoses"]["Row"];
export type DiagnosisContext = "monitor" | "api" | "incident" | "security";
