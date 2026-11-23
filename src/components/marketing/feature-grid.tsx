const features = [
  { index: "01", name: "Uptime & Latency", detail: "Live HTTP checks, exact timing, 30-day uptime bars, and threshold incidents." },
  { index: "02", name: "API Observatory", detail: "Execute real requests, inspect headers and payloads, and save reusable collections." },
  { index: "03", name: "Security Scanner", detail: "Audit certificates and security headers with actionable scores and grades." },
  { index: "04", name: "Incident Doctor", detail: "Diagnose real operational evidence with Groq and preserve every resolution." },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-violet-400">One operating system</p>
      <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Built for the moments infrastructure matters.</h2>
      <div className="mt-12 grid border-l border-t border-[#1F2633] md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.index} className="min-h-64 border-b border-r border-[#1F2633] bg-[#0E121A]/40 p-6 transition hover:bg-[#0E121A]">
            <p className="font-mono text-xs text-slate-600">{feature.index}</p>
            <h3 className="mt-16 text-base font-semibold">{feature.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">{feature.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
