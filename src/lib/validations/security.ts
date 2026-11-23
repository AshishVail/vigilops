import { z } from "zod";

export const createSecurityScanSchema = z.object({
  projectId: z.string().uuid(),
  domain: z
    .string()
    .trim()
    .min(3)
    .max(253)
    .transform((value) => value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase())
    .refine((value) => /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(value), "Enter a valid domain name"),
});

export type CreateSecurityScanInput = z.infer<typeof createSecurityScanSchema>;
