import { ArrowDown, ArrowRight, Check, Code2, Rocket, Workflow } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

const metrics = [
  { value: "Live HTTP", label: "Availability checks" },
  { value: "< 5 min", label: "Minimum check interval" },
  { value: "TLS + headers", label: "Security audits" },
  { value: "Evidence-led", label: "AI diagnosis" },
];

const steps = [
  { number: "01", title: "Add a service", text: "Connect a website or API endpoint and define what healthy looks like.", icon: Code2 },
  { number: "02", title: "VigilOps checks", text: "Scheduled checks record availability, latency, certificates, and security headers.", icon: Workflow },
  { number: "03", title: "Resolve with confidence", text: "Route alerts to your team, track the incident, and use evidence-backed diagnosis.", icon: Rocket },
];

const audiences = [
  { title: "Web agencies", text: "Keep a clear view of client sites and catch availability or certificate issues before clients do." },
  { title: "SaaS founders", text: "Build operational confidence early with uptime, incident workflows, and a public status page." },
  { title: "DevOps & backend", text: "Inspect API behavior, response timing, security posture, and incident evidence in one workspace." },
];

const questions = [
  ["Is VigilOps free to use?", "VigilOps is designed around free-tier infrastructure and includes real monitoring, API checks, security scans, and incident workflows within documented workspace limits."],
  ["How often are monitors checked?", "Monitor intervals start at five minutes. Checks run server-side, record response status and latency, and can open incidents when a configured check fails."],
  ["What does the security scan inspect?", "The scanner reviews the live TLS certificate and selected HTTP security headers, then reports prioritized findings and remediation guidance."],
  ["Can I share service health publicly?", "Yes. Workspace owners can opt in to a public status page. Public views expose operational status fields only, not private request headers or credentials."],
  ["How is sensitive data handled?", "Workspace access is protected by Supabase authentication and row-level security. AI diagnosis redacts sensitive evidence before sending it to the configured provider."],
  ["Do I need to configure AI or email?", "Core monitoring and security checks do not require AI or email credentials. Groq diagnosis and Resend email alerts are optional integrations."],
];

export function MetricsStrip() {
  return (
    <section aria-label="Platform capabilities" className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4 lg:px-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center md:text-left">
            <p className="font-mono text-lg font-semibold tracking-tight text-slate-900">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-600">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-indigo-700">A clearer operating rhythm</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">From first check to confident resolution.</h2>
        </ScrollReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, text, icon: Icon }, index) => (
            <ScrollReveal key={number}>
              <article className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
                  <span className="font-mono text-xs text-slate-600">STEP {number}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-4 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-indigo-300 md:block" />}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UseCases() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <ScrollReveal>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-indigo-700">Built for your kind of work</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Operational clarity at every stage.</h2>
      </ScrollReveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {audiences.map((audience) => (
          <ScrollReveal key={audience.title}>
            <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Check className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{audience.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{audience.text}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-indigo-700">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Good questions deserve clear answers.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">Learn how the platform works before connecting a service.</p>
        </ScrollReveal>
        <div className="space-y-3">
          {questions.map(([question, answer]) => (
            <ScrollReveal key={question}>
              <details className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                  {question}<ArrowDown className="h-4 w-4 shrink-0 text-slate-600 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 pr-7 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BottomCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 shadow-sm sm:p-12">
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-700">Start with one endpoint</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Make the next incident easier to understand.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Set up your workspace and get a dependable operational view without a long implementation cycle.</p>
            </div>
            <Link href="/signup" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
