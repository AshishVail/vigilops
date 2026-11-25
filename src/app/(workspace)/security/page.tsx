"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { useSecurityScans, useDeleteSecurityScan } from "@/hooks/use-security-scans";
import { ScanForm } from "@/components/security/scan-form";
import { ScanHistory } from "@/components/security/scan-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function SecurityPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const projectId = useWorkspaceStore((state) => state.projectId);
  const projects = useProjects(workspaceId);
  const effectiveProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const scans = useSecurityScans(effectiveProjectId, workspaceId);
  const remove = useDeleteSecurityScan();

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Posture</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Security scanner</h1></div><Button variant="outline" onClick={() => void scans.refetch()} disabled={scans.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${scans.isFetching ? "animate-spin" : ""}`} />Refresh history</Button></div>
      {effectiveProjectId ? <ScanForm projectId={effectiveProjectId} onScanned={(scanId)=>router.push(`/security/${scanId}`)} /> : <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Select a workspace project to run a scan.</p>}
      {scans.isLoading ? <Skeleton className="h-64"/> : <ScanHistory scans={scans.data ?? []} onDelete={(scanId)=>remove.mutate(scanId)} />}
    </div>
  );
}
