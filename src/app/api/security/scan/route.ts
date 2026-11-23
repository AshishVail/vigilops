import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSecurityScanSchema } from "@/lib/validations/security";
import { validateSafeUrl } from "@/lib/network/url-safety";
import { resolveHostname } from "@/lib/network/dns";
import { inspectCertificate } from "@/lib/network/certificate";
import { runLiveHttpCheck } from "@/lib/network/http-client";
import { inspectSecurityHeaders } from "@/lib/security/headers";
import { evaluateCertificatePolicy } from "@/lib/security/certificate-policy";
import { generateSecurityFindings } from "@/lib/security/findings";
import { calculateSecurityScore } from "@/lib/security/scoring";
import { errorJson, forbiddenJson, successJson, unauthorizedJson } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const projectId = request.nextUrl.searchParams.get("projectId");
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!projectId && !workspaceId) return errorJson("projectId or workspaceId is required", 400, "VALIDATION_ERROR");

  let projectIds: string[] = [];
  if (projectId) {
    const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", projectId).maybeSingle();
    if (!project) return forbiddenJson();
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    projectIds = [projectId];
  } else if (workspaceId) {
    const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", auth.user.id).maybeSingle();
    if (!membership) return forbiddenJson();
    const { data: projects } = await auth.supabase.from("projects").select("id").eq("workspace_id", workspaceId);
    projectIds = (projects ?? []).map((project) => project.id);
  }

  let query = auth.supabase.from("security_scans").select("*").order("scanned_at", { ascending: false }).limit(100);
  query = projectIds.length
    ? query.in("project_id", projectIds)
    : query.in("project_id", ["00000000-0000-0000-0000-000000000000"]);
  const { data, error } = await query;
  if (error) return errorJson(error.message, 500, "SECURITY_SCAN_LIST_FAILED");
  return successJson(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return unauthorizedJson();
  const parsed = createSecurityScanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("Enter a valid domain", 400, "VALIDATION_ERROR");

  const { data: project } = await auth.supabase.from("projects").select("workspace_id").eq("id", parsed.data.projectId).maybeSingle();
  if (!project) return forbiddenJson();
  const { data: membership } = await auth.supabase.from("workspace_members").select("role").eq("workspace_id", project.workspace_id).eq("user_id", auth.user.id).maybeSingle();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) return forbiddenJson();

  try {
    await validateSafeUrl(`https://${parsed.data.domain}`);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Target is not safe", 400, "UNSAFE_DOMAIN");
  }

  const addresses = await resolveHostname(parsed.data.domain);
  const resolvedIp = addresses[0]?.address ?? null;
  const certificate = await inspectCertificate(parsed.data.domain, 10000);
  const httpCheck = await runLiveHttpCheck(`http://${parsed.data.domain}`, { timeoutMs: 10000 });
  const httpsCheck = await runLiveHttpCheck(`https://${parsed.data.domain}`, { timeoutMs: 10000 });
  const headers = inspectSecurityHeaders(httpsCheck.responseHeaders);
  const redirectsToHttps = httpCheck.status >= 300 && httpCheck.status < 400
    ? Boolean(httpCheck.responseHeaders.location?.startsWith("https://"))
    : false;
  const certificatePolicy = evaluateCertificatePolicy(certificate, redirectsToHttps);
  const findings = generateSecurityFindings(headers, certificatePolicy);
  const score = calculateSecurityScore(headers, certificatePolicy);

  const rawResult = {
    domain: parsed.data.domain,
    resolvedIp,
    httpStatus: httpCheck.status,
    httpsStatus: httpsCheck.status,
    headers,
    certificate,
    certificatePolicy,
    responseTiming: httpsCheck.timing,
  };

  const admin = createAdminClient();
  const { data: scan, error } = await admin.from("security_scans").insert({
    project_id: parsed.data.projectId,
    domain: parsed.data.domain,
    resolved_ip: resolvedIp,
    security_score: score.score,
    grade: score.grade,
    certificate,
    headers: Object.fromEntries(headers.map((header) => [header.name, header.value ?? null])),
    findings,
    raw_result: rawResult,
    scanned_by: auth.user.id,
  }).select("*").single();
  if (error) return errorJson(error.message, 500, "SECURITY_SCAN_FAILED");
  return successJson(scan, { status: 201 });
}
