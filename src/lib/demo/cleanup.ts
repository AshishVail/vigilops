import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function cleanupExpiredDemoWorkspaces() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cleanup_expired_demo_workspaces");
  if (error) throw new Error(`Demo cleanup failed: ${error.message}`);
  return data ?? 0;
}
