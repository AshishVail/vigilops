import { z } from "zod";

export const cursorPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const logFilterSchema = z.object({
  projectId: z.string().uuid(),
  service: z.enum(["monitor", "api", "security", "incident"]).optional(),
  statusGroup: z.enum(["2xx", "4xx", "5xx", "timeout", "error"]).optional(),
  search: z.string().trim().max(200).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  requestId: z.string().uuid().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
