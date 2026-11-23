import { NextRequest } from "next/server";
import { cleanupExpiredDemoWorkspaces } from "@/lib/demo/cleanup";
import { errorJson, successJson } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authorization !== `Bearer ${secret}`) {
    return errorJson("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const deletedCount = await cleanupExpiredDemoWorkspaces();
    return successJson({ deletedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demo cleanup failed";
    return errorJson(message, 500, "DEMO_CLEANUP_FAILED");
  }
}
