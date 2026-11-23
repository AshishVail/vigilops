import { createAdminClient } from "../src/lib/supabase/admin";
import { resetDemoWorkspace } from "../src/lib/demo/reset";

const userId = process.env.DEMO_USER_ID;
const workspaceId = process.env.DEMO_WORKSPACE_ID;
if (!userId) {
  console.error("DEMO_USER_ID is required");
  process.exit(1);
}

const admin = createAdminClient();
const { data: user, error } = await admin.auth.admin.getUserById(userId);
if (error || !user) {
  console.error("Supabase demo user was not found");
  process.exit(1);
}
const result = await resetDemoWorkspace(userId, workspaceId);
console.log(JSON.stringify(result, null, 2));
