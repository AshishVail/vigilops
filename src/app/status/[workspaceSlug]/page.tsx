import { notFound } from "next/navigation";
import { getPublicStatus } from "@/lib/status/public-query";
import { StatusHeader } from "@/components/status/status-header";
import { PublicMonitorCard } from "@/components/status/public-monitor-card";
import { PublicIncidents } from "@/components/status/public-incidents";
import { SubscribeButton } from "@/components/status/subscribe-button";

export default async function PublicStatusPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const status = await getPublicStatus(workspaceSlug);
  if (!status) notFound();

  return (
    <main className="min-h-screen bg-[#07090D] text-slate-100">
      <StatusHeader status={status}/>
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-600">Services</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Current operational status</h1></div><SubscribeButton/></div>
        <div className="space-y-3">{status.monitors.map((monitor)=><PublicMonitorCard key={monitor.name} monitor={monitor}/>)}</div>
        {status.monitors.length===0&&<p className="rounded-xl border border-[#1F2633] bg-[#0E121A] py-12 text-center text-sm text-slate-600">No public services are currently configured.</p>}
        <div className="mt-6"><PublicIncidents incidents={status.incidents}/></div>
      </div>
    </main>
  );
}
