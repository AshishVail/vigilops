const nodes = [
  ["Next.js + Vercel", "App Router · server-side network checks"],
  ["Supabase", "Postgres · Auth · Row Level Security"],
  ["Scheduled checks", "GitHub Actions cron · bounded HTTP requests"],
  ["Optional providers", "Groq diagnosis · Resend email alerts"],
];

export function ArchitecturePreview() {
  return (
    <section id="architecture" className="scroll-mt-24 border-y border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[.75fr_1fr] lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-700">Architecture &amp; reliability</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">A practical stack with security built into the flow.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">Requests execute server-side with bounded timeouts and response sizes. Supabase authentication and row-level security scope customer data by workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {nodes.map(([name, detail]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><h3 className="text-sm font-semibold text-slate-900">{name}</h3></div>
              <p className="mt-2 font-mono text-xs leading-5 text-slate-600">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
