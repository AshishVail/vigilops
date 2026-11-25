import { Activity, BellRing, Bot, Braces, FileSearch, Globe2, ShieldCheck, Users } from "lucide-react";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

const features = [
  { index: "01", name: "Uptime & latency", detail: "Know when a service slows down or goes offline with real HTTP checks.", icon: Activity, points: ["5-minute check intervals", "Response time history"] },
  { index: "02", name: "Security scanner", detail: "See certificate health and security-header gaps before they become incidents.", icon: ShieldCheck, points: ["TLS certificate review", "Actionable header findings"] },
  { index: "03", name: "API observatory", detail: "Send real API requests and save repeatable workflows in collections.", icon: Braces, points: ["Seven HTTP methods", "Shareable request collections"] },
  { index: "04", name: "AI incident doctor", detail: "Turn redacted operational evidence into grounded next steps.", icon: Bot, points: ["Evidence-based diagnosis", "Practical remediation steps"] },
  { index: "05", name: "Instant alerts", detail: "Route downtime and recovery events to the channels your team uses.", icon: BellRing, points: ["Slack and Discord webhooks", "Optional email delivery"] },
  { index: "06", name: "Public status pages", detail: "Give customers a clear, safe view of service health and incident updates.", icon: Globe2, points: ["Workspace opt-in control", "Uptime and incident history"] },
  { index: "07", name: "Logs explorer", detail: "Search operational events and export filtered evidence for your workflow.", icon: FileSearch, points: ["Request-level detail", "CSV and JSON export"] },
  { index: "08", name: "Team workspaces", detail: "Keep projects, access, and operational context organized together.", icon: Users, points: ["Role-based access", "Project-scoped services"] },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 lg:px-8">
      <ScrollReveal>
        <span id="security" className="scroll-mt-24" />
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-indigo-700">One operating system</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">The signals your team needs. The clarity it deserves.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Move from scattered checks and disconnected tools to a dependable operational picture.</p>
      </ScrollReveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <ScrollReveal key={feature.index}>
            <article className="group h-full min-h-64 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><feature.icon className="h-5 w-5" /></span>
                <span className="font-mono text-xs text-slate-600">{feature.index}</span>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-900">{feature.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.detail}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                {feature.points.map((point) => <li key={point} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-emerald-500" />{point}</li>)}
              </ul>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
