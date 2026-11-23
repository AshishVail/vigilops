import { z } from "zod";

export const monitorMethodSchema = z.enum(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);

export const createMonitorSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  url: z.string().url().refine((value) => /^https?:\/\//i.test(value), "Only HTTP or HTTPS URLs are allowed"),
  method: monitorMethodSchema.default("GET"),
  intervalSeconds: z.number().int().min(300).max(86400).default(300),
  timeoutMs: z.number().int().min(1000).max(10000).default(10000),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).min(1).max(20).default([200]),
  headers: z.record(z.string(), z.string()).optional().default({}).refine((value) => Object.keys(value).length <= 40, "At most 40 headers are allowed"),
});

export const updateMonitorSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  url: z.string().url().refine((value) => /^https?:\/\//i.test(value)).optional(),
  method: monitorMethodSchema.optional(),
  intervalSeconds: z.number().int().min(300).max(86400).optional(),
  timeoutMs: z.number().int().min(1000).max(10000).optional(),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).min(1).max(20).optional(),
  headers: z.record(z.string(), z.string()).optional().refine((value) => value === undefined || Object.keys(value).length <= 40, "At most 40 headers are allowed"),
  isActive: z.boolean().optional(),
});

export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;
