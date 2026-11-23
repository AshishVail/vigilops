const nodes = [
  ["Vercel", "Edge & Node routes"],
  ["Supabase", "Postgres, Auth, RLS"],
  ["Groq", "Incident diagnosis"],
  ["Resend", "Email alerts"],
];

export function ArchitecturePreview() {
  return (
    <section id="architecture" className="border-y border-[#1F2633] bg-[#090B10]/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.75fr_1fr] lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-400">Architecture</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Free-tier infrastructure, production behavior.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">Server-side checks and scoped API execution keep credentials off the browser while Supabase RLS isolates every workspace.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-[#1F2633] bg-[#1F2633] sm:grid-cols-2">
          {nodes.map(([name, detail]) => (
            <div key={name} className="bg-[#0E121A] p-6">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><h3 className="text-sm font-semibold">{name}</h3></div>
              <p className="mt-2 font-mono text-xs text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
