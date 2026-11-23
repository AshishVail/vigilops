import type { PublicIncident } from "@/lib/status/incident-history";

export function PublicIncidents({ incidents }: { incidents: PublicIncident[] }) {
  return (
    <section className="rounded-xl border border-[#1F2633] bg-[#0E121A] p-5">
      <h2 className="text-sm font-semibold">Incident history</h2>
      <div className="mt-4 space-y-2">
        {incidents.map((incident,index)=>(
          <article key={`${incident.title}-${incident.startedAt}-${index}`} className="rounded-lg border border-[#1F2633] px-4 py-3">
            <div className="flex items-start justify-between gap-3"><p className="text-sm text-slate-300">{incident.title}</p><span className={`h-2 w-2 shrink-0 rounded-full ${incident.status==="resolved"?"bg-emerald-500":"bg-amber-500"}`}/></div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">{new Date(incident.startedAt).toLocaleString()} · {incident.status}</p>
          </article>
        ))}
        {incidents.length===0&&<p className="py-8 text-center text-sm text-slate-600">No public incidents recorded.</p>}
      </div>
    </section>
  );
}
