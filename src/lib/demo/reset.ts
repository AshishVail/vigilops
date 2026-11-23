import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedDemoWorkspace } from "@/lib/demo/seed";

export async function resetDemoWorkspace(userId: string, workspaceId?: string) {
  const supabase = createAdminClient();

  if (workspaceId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) throw new Error("The demo workspace is not accessible to this user.");

    await supabase.from("workspaces").delete().eq("id", workspaceId).eq("is_demo", true);
  }

  return seedDemoWorkspace(userId);
}
