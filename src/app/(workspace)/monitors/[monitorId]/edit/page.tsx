"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useMonitor } from "@/hooks/use-monitors";
import { MonitorForm } from "@/components/monitors/monitor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditMonitorPage({ params }: { params: Promise<{ monitorId: string }> }) {
  const { monitorId } = use(params);
  const router = useRouter();
  const monitor = useMonitor(monitorId);
  if (monitor.isLoading) return <div className="p-5 lg:p-8"><Skeleton className="h-96"/></div>;
  if (!monitor.data) return <div className="p-5 lg:p-8 text-sm text-slate-500">Monitor not found.</div>;
  return <div className="mx-auto max-w-4xl p-5 lg:p-8"><p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Edit monitor</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{monitor.data.name}</h1><Card className="mt-6"><CardHeader><CardTitle>Target configuration</CardTitle></CardHeader><CardContent><MonitorForm projectId={monitor.data.project_id} monitor={monitor.data} onSaved={() => router.push(`/monitors/${monitorId}`)} /></CardContent></Card></div>;
}
