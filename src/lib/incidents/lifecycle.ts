import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { dispatchAlert } from "@/lib/alerts/dispatcher";

export type MonitorLifecycleMonitor = {
  id: string;
  project_id: string;
  name: string;
  url: string;
  status: "operating" | "degraded" | "down" | "paused";
};

export async function applyMonitorLifecycle(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  monitor: MonitorLifecycleMonitor,
  successful: boolean,
) {
  if (successful) {
    const { data: openIncident } = await supabase
      .from("incidents")
      .select("*")
      .eq("monitor_id", monitor.id)
      .neq("status", "resolved")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (openIncident) {
      await supabase.from("incident_updates").insert({
        incident_id: openIncident.id,
        previous_status: openIncident.status,
        new_status: "resolved",
        message: "Monitor recovered successfully.",
      });
      await supabase.from("incidents").update({
        status: "resolved",
        resolution_notes: "Automatically resolved because the monitor recovered.",
        resolved_at: new Date().toISOString(),
      }).eq("id", openIncident.id);

      await dispatchAlert(supabase, workspaceId, monitor.project_id, openIncident.id, {
        event: "recovered",
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        incidentId: openIncident.id,
        message: `${monitor.name} has recovered and is responding successfully.`,
        timestamp: new Date().toISOString(),
        status: "operating",
      }, "recovered");
    }
    return null;
  }

  if (monitor.status === "down") return null;

  const { data: incident, error } = await supabase.from("incidents").insert({
    project_id: monitor.project_id,
    monitor_id: monitor.id,
    title: `${monitor.name} is down`,
    summary: `VigilOps detected a failed live check for ${monitor.url}.`,
    status: "investigating",
    severity: "high",
  }).select("*").single();
  if (error) throw new Error(error.message);

  await supabase.from("incident_updates").insert({
    incident_id: incident.id,
    previous_status: null,
    new_status: "investigating",
    message: "Incident opened automatically after a monitor failure.",
  });

  await dispatchAlert(supabase, workspaceId, monitor.project_id, incident.id, {
    event: "down",
    monitorName: monitor.name,
    monitorUrl: monitor.url,
    incidentId: incident.id,
    message: `${monitor.name} is not responding as expected.`,
    timestamp: new Date().toISOString(),
    status: "down",
  }, "down");

  return incident;
}
