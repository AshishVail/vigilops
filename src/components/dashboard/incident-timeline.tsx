import type { DashboardData } from "@/lib/analytics/dashboard";

function distance(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export function IncidentTimeline({ data }: { data: DashboardData["incidents"] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Recent incidents</h2>
      <div className="mt-4 space-y-1">
        {data.map((incident) => (
          <article key={incident.id} className="flex gap-3 rounded-lg px-2 py-3 hover:bg-white/[0.025]">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${incident.status === "resolved" ? "bg-emerald-500" : incident.severity === "critical" ? "bg-rose-500" : "bg-amber-500"}`}/>
            <div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-600">{incident.title}</p><p className="mt-1 font-mono text-[11px] text-slate-600">{incident.status} · {incident.severity}</p></div>
            <time className="shrink-0 text-xs text-slate-600">{distance(incident.startedAt)}</time>
          </article>
        ))}
        {data.length === 0 && <p className="py-10 text-center text-sm text-slate-600">No active incidents.</p>}
      </div>
    </section>
  );
}
