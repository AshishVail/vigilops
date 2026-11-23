import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateIncidentSchema } from "@/lib/validations/incident";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

async function accessIncident(auth: Awaited<ReturnType<typeof requireAuth>>, incidentId: string) {
  if (!auth) return null;
  const { data: incident } = await auth.supabase.from("incidents").select("*, project:projects(workspace_id)").eq("id", incidentId).maybeSingle();
  if (!incident) return null;
  const project = incident.project as { workspace_id: string };
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return null;
  return { incident, workspaceId: project.workspace_id, role: membership.role };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ incidentId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { incidentId } = await context.params;
  const access = await accessIncident(auth, incidentId);
  if (!access) return forbiddenJson();
  const { data: updates } = await auth.supabase.from("incident_updates").select("*").eq("incident_id", incidentId).order("created_at", { ascending: true });
  return successJson({ incident: access.incident, updates: updates ?? [] });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ incidentId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { incidentId } = await context.params;
  const access = await accessIncident(auth, incidentId);
  if (!access || !["owner", "admin", "member"].includes(access.role)) return forbiddenJson();
  const parsed = updateIncidentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid incident data", 400, "VALIDATION_ERROR");

  const updates: {
    title?: string;
    summary?: string | null;
    status?: "investigating" | "identified" | "monitoring" | "resolved";
    severity?: "low" | "medium" | "high" | "critical";
    root_cause_notes?: string | null;
    resolution_notes?: string | null;
    resolved_at?: string | null;
  } = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.summary !== undefined) updates.summary = parsed.data.summary;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.severity !== undefined) updates.severity = parsed.data.severity;
  if (parsed.data.rootCauseNotes !== undefined) updates.root_cause_notes = parsed.data.rootCauseNotes;
  if (parsed.data.resolutionNotes !== undefined) updates.resolution_notes = parsed.data.resolutionNotes;
  if (parsed.data.status === "resolved") updates.resolved_at = new Date().toISOString();
  if (parsed.data.status && parsed.data.status !== access.incident.status) {
    const rank = { investigating: 0, identified: 1, monitoring: 2, resolved: 3 };
    if (rank[parsed.data.status] < rank[access.incident.status as keyof typeof rank]) {
      return errorJson("Incident status cannot move backwards", 409, "INVALID_STATUS_TRANSITION");
    }
  }

  const admin = createAdminClient();
  const { data: incident, error } = await admin.from("incidents").update(updates).eq("id", incidentId).select("*").single();
  if (error) return errorJson(error.message, 500, "INCIDENT_UPDATE_FAILED");
  if (parsed.data.status && parsed.data.status !== access.incident.status) {
    await admin.from("incident_updates").insert({
      incident_id: incidentId,
      previous_status: access.incident.status,
      new_status: parsed.data.status,
      message: "Incident status updated.",
      created_by: auth.user.id,
    });
  }
  return successJson(incident);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ incidentId: string }> }) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const { incidentId } = await context.params;
  const access = await accessIncident(auth, incidentId);
  if (!access || !["owner", "admin"].includes(access.role)) return forbiddenJson();
  const admin = createAdminClient();
  const { error } = await admin.from("incidents").delete().eq("id", incidentId);
  if (error) return errorJson(error.message, 500, "INCIDENT_DELETE_FAILED");
  return successJson({ deleted: true });
}
