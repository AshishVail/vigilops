import { z } from "zod";

export const alertChannelSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("discord"),
    workspaceId: z.string().uuid(),
    projectId: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(2).max(80),
    destination: z.string().url().refine((value) => /^https:\/\/(discord\.com|discordapp\.com)\//i.test(value), "Enter a Discord webhook URL"),
    isActive: z.boolean().default(true),
    onDown: z.boolean().default(true),
    onRecovery: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("slack"),
    workspaceId: z.string().uuid(),
    projectId: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(2).max(80),
    destination: z.string().url().refine((value) => /^https:\/\/hooks\.slack\.com\/services\//i.test(value), "Enter a Slack webhook URL"),
    isActive: z.boolean().default(true),
    onDown: z.boolean().default(true),
    onRecovery: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("email"),
    workspaceId: z.string().uuid(),
    projectId: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(2).max(80),
    destination: z.string().email(),
    isActive: z.boolean().default(true),
    onDown: z.boolean().default(true),
    onRecovery: z.boolean().default(true),
  }),
]);

export const updateAlertChannelSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(80).optional(),
  destination: z.string().min(3).max(2048).optional(),
  isActive: z.boolean().optional(),
  onDown: z.boolean().optional(),
  onRecovery: z.boolean().optional(),
});

export type AlertChannelInput = z.infer<typeof alertChannelSchema>;
