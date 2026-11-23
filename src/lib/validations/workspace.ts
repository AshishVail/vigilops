import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphen-separated words").max(80).optional(),
  publicStatusEnabled: z.boolean().optional().default(false),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).optional(),
  publicStatusEnabled: z.boolean().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
