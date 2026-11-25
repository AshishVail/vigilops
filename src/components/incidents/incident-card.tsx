import Link from "next/link";
import type { Incident } from "@/lib/types/incident";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { Badge } from "@/components/ui/badge";

export function IncidentCard({ incident }: { incident: Incident }) {
  const severityVariant = incident.severity === "critical" || incident.severity === "high" ? "danger" : incident.severity === "medium" ? "warning" : "default";
  return (
    <Link href={`/incidents/${incident.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-violet-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{incident.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{incident.summary ?? "No incident summary."}</p>
        </div>
        <Badge variant={severityVariant}>{incident.severity}</Badge>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <IncidentStatusBadge status={incident.status} />
        <time className="font-mono text-[11px] text-slate-600">{new Date(incident.started_at).toLocaleString()}</time>
      </div>
    </Link>
  );
}
