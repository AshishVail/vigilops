"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { MonitorForm } from "@/components/monitors/monitor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspaces } from "@/hooks/use-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewMonitorPage() {
  const router = useRouter();
  const workspaces = useWorkspaces();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const selectedProjectId = useWorkspaceStore((state) => state.projectId);
  const setProject = useWorkspaceStore((state) => state.setProject);
  const projects = useProjects(workspaceId);
  const projectId = selectedProjectId ?? projects.data?.[0]?.id ?? null;

  useEffect(() => {
    if (!selectedProjectId && projectId) setProject(projectId);
  }, [selectedProjectId, projectId, setProject]);

  if (workspaces.isLoading || (workspaces.data?.length && !workspaceId)) {
    return <div className="space-y-4 p-5 lg:p-8"><Skeleton className="h-8 w-64"/><Card><CardContent className="h-64 animate-pulse" /></Card></div>;
  }
  if (workspaces.error) {
    return <div className="p-5 lg:p-8"><EmptyState title="Workspaces unavailable" description={workspaces.error instanceof Error ? workspaces.error.message : "Unable to load your workspaces."} action={<Button variant="outline" onClick={() => void workspaces.refetch()}>Retry</Button>}/></div>;
  }
  if (!workspaces.data?.length) {
    return <div className="p-5 lg:p-8"><EmptyState title="Create a workspace first" description="Monitors belong to a workspace project. Create or join a workspace to continue." action={<Link href="/settings"><Button>Open workspace settings</Button></Link>}/></div>;
  }
  if (projects.isLoading) return <div className="p-5 lg:p-8"><Card><CardContent className="h-64 animate-pulse" /></Card></div>;
  if (projects.error) return <div className="p-5 lg:p-8"><EmptyState title="Projects unavailable" description={projects.error.message} action={<Button variant="outline" onClick={() => void projects.refetch()}>Retry</Button>}/></div>;
  if (!projectId) return <div className="p-5 lg:p-8"><EmptyState title="No project found" description="Create a project in workspace settings before adding a monitor."/></div>;
  return (
    <div className="mx-auto max-w-4xl p-5 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">New monitor</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Configure a live check</h1>
      <Card className="mt-6"><CardHeader><CardTitle>Target configuration</CardTitle></CardHeader><CardContent><MonitorForm projectId={projectId} onSaved={(monitor)=>router.push(`/monitors/${monitor.id}`)} /></CardContent></Card>
    </div>
  );
}
