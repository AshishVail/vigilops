"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { MonitorForm } from "@/components/monitors/monitor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function NewMonitorPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const selectedProjectId = useWorkspaceStore((state) => state.projectId);
  const setProject = useWorkspaceStore((state) => state.setProject);
  const projects = useProjects(workspaceId);
  const projectId = selectedProjectId ?? projects.data?.[0]?.id ?? null;

  useEffect(() => {
    if (!selectedProjectId && projectId) setProject(projectId);
  }, [selectedProjectId, projectId, setProject]);

  if (!workspaceId) return <div className="p-5 lg:p-8"><EmptyState title="Workspace unavailable" description="Select a workspace before creating a monitor."/></div>;
  if (projects.isLoading) return <div className="p-5 lg:p-8"><Card><CardContent className="h-64 animate-pulse" /></Card></div>;
  if (!projectId) return <div className="p-5 lg:p-8"><EmptyState title="No project found" description="Create a project in workspace settings before adding a monitor."/></div>;
  return (
    <div className="mx-auto max-w-4xl p-5 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">New monitor</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Configure a live check</h1>
      <Card className="mt-6"><CardHeader><CardTitle>Target configuration</CardTitle></CardHeader><CardContent><MonitorForm projectId={projectId} onSaved={(monitor)=>router.push(`/monitors/${monitor.id}`)} /></CardContent></Card>
    </div>
  );
}
