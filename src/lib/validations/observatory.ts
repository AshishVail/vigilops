import { z } from "zod";

export const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
export const queryParamSchema = z.object({
  key: z.string().trim().max(200),
  value: z.string().max(5000),
  enabled: z.boolean().default(true),
});

export const apiAuthSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("bearer"), token: z.string().min(1).max(8192) }),
  z.object({ type: z.literal("api_key"), headerName: z.string().trim().min(1).max(100), value: z.string().min(1).max(8192) }),
]);

export const observatoryRequestSchema = z.object({
  projectId: z.string().uuid().optional(),
  requestId: z.string().uuid().optional(),
  method: httpMethodSchema,
  url: z.string().url().refine((value) => /^https?:\/\//i.test(value), "Only HTTP or HTTPS URLs are allowed"),
  queryParams: z.array(queryParamSchema).max(100).default([]),
  headers: z.record(z.string(), z.string()).default({}).refine((value) => Object.keys(value).length <= 40, "At most 40 headers are allowed"),
  auth: apiAuthSchema.default({ type: "none" }),
  body: z.union([z.string(), z.record(z.string(), z.unknown()), z.array(z.unknown()), z.null()]).optional(),
  timeoutMs: z.number().int().min(1000).max(10000).default(10000),
});

export type ObservatoryRequestInput = z.infer<typeof observatoryRequestSchema>;
