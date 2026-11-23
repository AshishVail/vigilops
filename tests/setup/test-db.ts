export const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "http://127.0.0.1:54321";

export function isDatabaseConfigured() {
  return Boolean(
    process.env.TEST_DATABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
