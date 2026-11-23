import { z } from "zod";
import { httpMethodSchema, queryParamSchema, apiAuthSchema } from "@/lib/validations/observatory";

export const createCollectionSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export const saveApiRequestSchema = z.object({
  collectionId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  method: httpMethodSchema,
  url: z.string().url(),
  queryParams: z.array(queryParamSchema).max(100).default([]),
  headers: z.record(z.string(), z.string()).default({}).refine((value) => Object.keys(value).length <= 40, "At most 40 headers are allowed"),
  auth: apiAuthSchema.default({ type: "none" }),
  body: z.unknown().optional(),
});

export const updateApiRequestSchema = saveApiRequestSchema.omit({ collectionId: true }).partial();

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type SaveApiRequestInput = z.infer<typeof saveApiRequestSchema>;
