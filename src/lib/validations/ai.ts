import { z } from "zod";
import { incidentSeveritySchema } from "@/lib/validations/incident";

export const diagnosisContextSchema = z.enum(["monitor", "api", "incident", "security"]);

export const diagnoseSchema = z.object({
  context: diagnosisContextSchema,
  referenceId: z.string().uuid(),
});

export const diagnosisResponseSchema = z.object({
  rootCause: z.string().trim().min(10).max(4000),
  severity: incidentSeveritySchema,
  recommendedFix: z.string().trim().min(10).max(6000),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  model: z.string().min(1).max(100),
});

export type DiagnoseInput = z.infer<typeof diagnoseSchema>;
