import { spawnSync } from "node:child_process";

const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error("SUPABASE_PROJECT_REF is required to generate Supabase database types.");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--project-id", projectRef, "--schema", "public"],
  { stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
