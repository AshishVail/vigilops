import type { DashboardData } from "@/lib/analytics/dashboard";

function distance(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export function ActivityFeed({ data }: { data: DashboardData["activity"] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Live activity</h2>
      <div className="mt-4 space-y-1">
        {data.map((item) => (
          <article key={item.id} className="flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-white/[0.025]">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,.5)]"/>
            <div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-600">{item.title}</p><p className="mt-1 font-mono text-[11px] text-slate-600">{item.type.replaceAll("_"," ")}</p></div>
            <time className="shrink-0 text-xs text-slate-600">{distance(item.createdAt)}</time>
          </article>
        ))}
        {data.length === 0 && <p className="py-10 text-center text-sm text-slate-600">No workspace activity yet.</p>}
      </div>
    </section>
  );
}
