import { z } from "zod";

export const incidentStatusSchema = z.enum(["investigating", "identified", "monitoring", "resolved"]);
export const incidentSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const createIncidentSchema = z.object({
  projectId: z.string().uuid(),
  monitorId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(2000).optional(),
  severity: incidentSeveritySchema.default("medium"),
});

export const updateIncidentSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  summary: z.string().trim().max(2000).nullable().optional(),
  status: incidentStatusSchema.optional(),
  severity: incidentSeveritySchema.optional(),
  rootCauseNotes: z.string().trim().max(10000).nullable().optional(),
  resolutionNotes: z.string().trim().max(10000).nullable().optional(),
});

export const incidentUpdateSchema = z.object({
  status: incidentStatusSchema,
  message: z.string().trim().max(2000).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
