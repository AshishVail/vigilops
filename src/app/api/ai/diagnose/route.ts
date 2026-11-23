import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { diagnoseSchema } from "@/lib/validations/ai";
import { buildDiagnosisPrompts } from "@/lib/ai/prompts";
import { redactSensitiveValue } from "@/lib/ai/redaction";
import { diagnoseWithGroq } from "@/lib/ai/groq";
import { parseDiagnosis } from "@/lib/ai/parsing";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";
import type { Json } from "@/lib/types/database";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) return errorJson("projectId is required", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership) return forbiddenJson();
  const { data, error } = await auth.supabase
    .from("ai_diagnoses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return errorJson(error.message, 500, "AI_HISTORY_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = diagnoseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Invalid diagnosis context", 400, "VALIDATION_ERROR");

  let projectId: string | null = null;
  let evidence: Record<string, unknown> = {};
  const relation: { incidentId?: string; monitorId?: string; apiRunId?: string; securityScanId?: string } = {};

  if (parsed.data.context === "monitor") {
    const { data: monitor } = await auth.supabase
      .from("monitors")
      .select("*, project:projects(id,workspace_id)")
      .eq("id", parsed.data.referenceId)
      .maybeSingle();
    if (!monitor) return forbiddenJson();
    const project = monitor.project as { id: string; workspace_id: string };
    projectId = project.id;
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    const { data: pings } = await auth.supabase.from("ping_logs").select("*").eq("monitor_id", monitor.id).order("checked_at", { ascending: false }).limit(20);
    evidence = { monitor, recentPings: pings ?? [] };
    relation.monitorId = monitor.id;
  } else if (parsed.data.context === "incident") {
    const { data: incident } = await auth.supabase
      .from("incidents")
      .select("*, project:projects(id,workspace_id)")
      .eq("id", parsed.data.referenceId)
      .maybeSingle();
    if (!incident) return forbiddenJson();
    const project = incident.project as { id: string; workspace_id: string };
    projectId = project.id;
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    const { data: updates } = await auth.supabase.from("incident_updates").select("*").eq("incident_id", incident.id).order("created_at", { ascending: true });
    evidence = { incident, timeline: updates ?? [] };
    relation.incidentId = incident.id;
  } else if (parsed.data.context === "api") {
    const { data: run } = await auth.supabase
      .from("api_runs")
      .select("*, project:projects(id,workspace_id)")
      .eq("id", parsed.data.referenceId)
      .maybeSingle();
    if (!run) return forbiddenJson();
    const project = run.project as { id: string; workspace_id: string };
    projectId = project.id;
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    evidence = { apiRun: run };
    relation.apiRunId = run.id;
  } else {
    const { data: scan } = await auth.supabase
      .from("security_scans")
      .select("*, project:projects(id,workspace_id)")
      .eq("id", parsed.data.referenceId)
      .maybeSingle();
    if (!scan) return forbiddenJson();
    const project = scan.project as { id: string; workspace_id: string };
    projectId = project.id;
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    evidence = { securityScan: scan };
    relation.securityScanId = scan.id;
  }

  if (!projectId) return errorJson("Unable to resolve diagnosis project", 400, "VALIDATION_ERROR");
  const redactedEvidence = redactSensitiveValue(evidence);
  const prompts = buildDiagnosisPrompts(parsed.data.context, redactedEvidence);
  let groqResult: { content: string; model: string };
  try {
    groqResult = await diagnoseWithGroq(prompts.system, prompts.user);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Groq diagnosis failed", 502, "GROQ_FAILED");
  }
  const diagnosis = parseDiagnosis(groqResult.content);
  const supportingEvidence = {
    ...(redactedEvidence as Record<string, unknown>),
    confidence: diagnosis.confidence,
    evidence: diagnosis.evidence,
    likelyCauses: diagnosis.likelyCauses,
    actionSteps: diagnosis.actionSteps,
  } as Json;

  const admin = createAdminClient();
  const { data: saved, error } = await admin.from("ai_diagnoses").insert({
    project_id: projectId,
    incident_id: relation.incidentId ?? null,
    monitor_id: relation.monitorId ?? null,
    api_run_id: relation.apiRunId ?? null,
    security_scan_id: relation.securityScanId ?? null,
    model: groqResult.model,
    severity: diagnosis.severity,
    root_cause: diagnosis.rootCause,
    recommended_fix: diagnosis.recommendedFix,
    supporting_evidence: supportingEvidence,
    created_by: auth.user.id,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "AI_DIAGNOSIS_SAVE_FAILED");
  return successJson({
    diagnosis: { ...diagnosis, model: groqResult.model },
    record: saved,
  });
}
