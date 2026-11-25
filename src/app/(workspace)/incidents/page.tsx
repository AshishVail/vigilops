"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { useIncidents } from "@/hooks/use-incidents";
import { IncidentList } from "@/components/incidents/incident-list";
import { CreateIncidentDialog } from "@/components/incidents/create-incident-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function IncidentsPage() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const projectId = useWorkspaceStore((state) => state.projectId);
  const projects = useProjects(workspaceId);
  const effectiveProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const incidents = useIncidents(effectiveProjectId, workspaceId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Operations</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Incidents</h1></div>
        <div className="flex items-center gap-2"><Button variant="outline" onClick={() => void incidents.refetch()} disabled={incidents.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${incidents.isFetching ? "animate-spin" : ""}`} />Refresh</Button><Button disabled={!effectiveProjectId} onClick={() => setCreateOpen(true)}>Create incident</Button></div>
      </div>
      {incidents.isLoading ? <div className="grid gap-4 lg:grid-cols-2">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-44"/>)}</div> : incidents.error ? <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700">{incidents.error.message}</p> : <IncidentList incidents={incidents.data ?? []}/>}
      {effectiveProjectId && <CreateIncidentDialog open={createOpen} onOpenChange={setCreateOpen} projectId={effectiveProjectId}/>}
    </div>
  );
}
