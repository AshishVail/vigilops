"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { useLogs, type LogFilters } from "@/hooks/use-logs";
import { LogExplorer } from "@/components/logs/log-explorer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function LogsPage() {
  const workspaceId = useWorkspaceStore((state)=>state.workspaceId);
  const projectId = useWorkspaceStore((state)=>state.projectId);
  const projects = useProjects(workspaceId);
  const effectiveProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const [filters,setFilters] = useState<LogFilters>({ projectId: effectiveProjectId });
  const activeFilters = { ...filters, projectId: effectiveProjectId };
  const logs = useLogs(activeFilters);
  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Observability</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Logs Explorer</h1></div><Button variant="outline" onClick={() => void logs.refetch()} disabled={logs.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${logs.isFetching ? "animate-spin" : ""}`} />Refresh</Button></div>
      <LogExplorer filters={activeFilters} onFiltersChange={setFilters} logs={logs.data?.items ?? []} loading={logs.isLoading}/>
    </div>
  );
}
