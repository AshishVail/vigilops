import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { incidentUpdateSchema } from "@/lib/validations/incident";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function POST(request: NextRequest, context: { params: Promise<{ incidentId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { incidentId } = await context.params;
  const parsed = incidentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid incident update", 400, "VALIDATION_ERROR");

  const { data: incident } = await auth.supabase.from("incidents").select("*, project:projects(workspace_id)").eq("id", incidentId).maybeSingle();
  if (!incident) return forbiddenJson();
  const project = incident.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  const rank = { investigating: 0, identified: 1, monitoring: 2, resolved: 3 };
  if (rank[parsed.data.status] < rank[incident.status as keyof typeof rank]) {
    return errorJson("Incident status cannot move backwards", 409, "INVALID_STATUS_TRANSITION");
  }

  const admin = createAdminClient();
  const { data: update, error } = await admin.from("incident_updates").insert({
    incident_id: incidentId,
    previous_status: incident.status,
    new_status: parsed.data.status,
    message: parsed.data.message ?? null,
    created_by: auth.user.id,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "INCIDENT_UPDATE_FAILED");

  await admin.from("incidents").update({
    status: parsed.data.status,
    resolved_at: parsed.data.status === "resolved" ? new Date().toISOString() : null,
  }).eq("id", incidentId);
  return successJson(update);
}
