import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  GROQ_API_KEY: z.string().min(20).optional().or(z.literal("")),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ALERT_TOKEN_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
  CRON_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  ALERT_FROM_EMAIL: z.string().min(3).optional(),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid VigilOps environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

console.log("VigilOps environment configuration is valid.");
