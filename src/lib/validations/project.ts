import { z } from "zod";

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default("#6366F1"),
  publicStatusEnabled: z.boolean().optional().default(false),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  publicStatusEnabled: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
