import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { demoMonitors, demoProjects, demoSecurityFinding } from "@/lib/demo/fixtures";

export type DemoSeedResult = {
  workspaceId: string;
  projectId: string;
  slug: string;
  expiresAt: string;
};

export async function seedDemoWorkspace(userId: string): Promise<DemoSeedResult> {
  const supabase = createAdminClient();
  const expiresAt = new Date(
    Date.now() + Number(process.env.DEMO_WORKSPACE_TTL_HOURS ?? "24") * 60 * 60 * 1000,
  ).toISOString();
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  const slug = `vigilops-demo-${suffix}`;

  await supabase.from("profiles").upsert({
    id: userId,
    email: null,
    full_name: "VigilOps Recruiter",
  });

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: "VigilOps Live Demo",
      slug,
      owner_id: userId,
      is_demo: true,
      expires_at: expiresAt,
      public_status_enabled: true,
    })
    .select("id")
    .single();

  if (workspaceError || !workspace) {
    throw new Error(`Unable to create demo workspace: ${workspaceError?.message ?? "Unknown error"}`);
  }

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: userId, role: "owner" });
  if (memberError) throw new Error(`Unable to join demo workspace: ${memberError.message}`);

  const projectFixture = demoProjects[0];
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      name: projectFixture.name,
      description: projectFixture.description,
      color: projectFixture.color,
      public_status_enabled: projectFixture.publicStatusEnabled,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(`Unable to create demo project: ${projectError?.message ?? "Unknown error"}`);
  }

  for (const fixture of demoMonitors) {
    const { data: monitor, error: monitorError } = await supabase
      .from("monitors")
      .insert({
        project_id: project.id,
        name: fixture.name,
        url: fixture.url,
        method: fixture.method,
        interval_seconds: fixture.intervalSeconds,
        timeout_ms: fixture.timeoutMs,
        expected_status_codes: fixture.expectedStatusCodes,
        headers: {},
        status: fixture.status,
        is_active: true,
        consecutive_failures: fixture.status === "down" ? 3 : 0,
        last_checked_at: new Date().toISOString(),
        next_check_at: new Date(Date.now() + 300_000).toISOString(),
        created_by: userId,
      })
      .select("id")
      .single();

    if (monitorError || !monitor) {
      throw new Error(`Unable to create demo monitor: ${monitorError?.message ?? "Unknown error"}`);
    }

    const pingRows = Array.from({ length: 36 }, (_, index) => {
      const hoursAgo = index * 2;
      const isFailure = fixture.status === "down" && index < 6;
      return {
        monitor_id: monitor.id,
        status: isFailure ? ("failure" as const) : ("success" as const),
        http_status: isFailure ? 503 : 200,
        latency_ms: isFailure ? 2400 + (index % 4) * 120 : 120 + ((index * 37) % 260),
        payload_size_bytes: isFailure ? 128 : 12500 + (index % 8) * 420,
        response_headers: {},
        error_message: isFailure ? "Simulated service degradation" : null,
        checked_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      };
    });

    const { error: pingError } = await supabase.from("ping_logs").insert(pingRows);
    if (pingError) throw new Error(`Unable to seed demo ping logs: ${pingError.message}`);
  }

  const { data: downMonitor } = await supabase
    .from("monitors")
    .select("id")
    .eq("project_id", project.id)
    .eq("status", "down")
    .limit(1)
    .maybeSingle();

  if (downMonitor) {
    const { data: incident } = await supabase
      .from("incidents")
      .insert({
        project_id: project.id,
        monitor_id: downMonitor.id,
        title: "Elevated payment gateway errors",
        summary: "The demo payment endpoint is currently returning simulated 503 responses.",
        status: "investigating",
        severity: "high",
        started_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (incident) {
      await supabase.from("incident_updates").insert({
        incident_id: incident.id,
        previous_status: null,
        new_status: "investigating",
        message: "VigilOps detected repeated failures and opened this incident.",
        created_by: userId,
      });
    }
  }

  const { data: collection } = await supabase
    .from("api_collections")
    .insert({
      project_id: project.id,
      name: "Platform API",
      description: "Saved requests for the live demo environment.",
      created_by: userId,
    })
    .select("id")
    .single();

  if (collection) {
    await supabase.from("api_requests").insert({
      collection_id: collection.id,
      name: "Health check",
      method: "GET",
      url: "https://example.com",
      query_params: [],
      headers: { Accept: "application/json" },
      auth: { type: "none" },
      body: null,
      created_by: userId,
    });
  }

  await supabase.from("security_scans").insert({
    project_id: project.id,
    domain: demoSecurityFinding.domain,
    resolved_ip: "104.18.27.120",
    security_score: demoSecurityFinding.security_score,
    grade: demoSecurityFinding.grade,
    certificate: demoSecurityFinding.certificate,
    headers: demoSecurityFinding.headers,
    findings: demoSecurityFinding.findings,
    raw_result: demoSecurityFinding,
    scanned_by: userId,
  });

  await supabase.from("activity_events").insert([
    { workspace_id: workspace.id, project_id: project.id, type: "monitor_created", title: "Live demo monitors created", metadata: { count: demoMonitors.length }, actor_id: userId },
    { workspace_id: workspace.id, project_id: project.id, type: "incident_created", title: "Payment gateway incident detected", metadata: { severity: "high" }, actor_id: userId },
  ]);

  return { workspaceId: workspace.id, projectId: project.id, slug, expiresAt };
}
