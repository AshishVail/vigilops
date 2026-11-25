"use client";

import type { Incident, IncidentUpdate } from "@/lib/types/incident";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { IncidentUpdateForm } from "@/components/incidents/incident-update-form";
import { Badge } from "@/components/ui/badge";

export function IncidentDetail({ incident, updates }: { incident: Incident; updates: IncidentUpdate[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{incident.title}</h1>
            <div className="flex items-center gap-2"><IncidentStatusBadge status={incident.status}/><Badge variant={incident.severity === "critical" || incident.severity === "high" ? "danger" : incident.severity === "medium" ? "warning" : "default"}>{incident.severity}</Badge></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{incident.summary ?? "No summary has been recorded."}</p>
          <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
            <div><dt className="text-xs text-slate-600">Started</dt><dd className="mt-1 font-mono text-xs text-slate-600">{new Date(incident.started_at).toLocaleString()}</dd></div>
            <div><dt className="text-xs text-slate-600">Resolved</dt><dd className="mt-1 font-mono text-xs text-slate-600">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : "Open"}</dd></div>
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Timeline</h2>
          <div className="mt-5 space-y-0">
            {updates.map((update, index) => (
              <article key={update.id} className="relative border-l border-slate-200 pb-6 pl-5 last:pb-0">
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#FFFFFF] bg-violet-500"/>
                <div className="flex items-start justify-between gap-3"><IncidentStatusBadge status={update.new_status}/><time className="font-mono text-[11px] text-slate-600">{new Date(update.created_at).toLocaleString()}</time></div>
                {update.message && <p className="mt-2 text-sm text-slate-600">{update.message}</p>}
                {index === updates.length - 1 && <span className="sr-only">Latest update</span>}
              </article>
            ))}
            {updates.length === 0 && <p className="py-6 text-sm text-slate-600">No timeline updates.</p>}
          </div>
        </section>
      </div>
      <IncidentUpdateForm incident={incident}/>
    </div>
  );
}
