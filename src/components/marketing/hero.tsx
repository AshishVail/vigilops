"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useDemoMode } from "@/hooks/use-demo-mode";

export function Hero() {
  const router = useRouter();
  const { startDemo, isStarting } = useDemoMode();
  const [error, setError] = useState("");

  async function tryDemo() {
    setError("");
    try {
      await startDemo();
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start demo");
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/70 via-white to-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 font-mono text-xs text-indigo-700 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            MONITOR · TEST · SECURE · RESOLVE
          </div>
          <h1 className="mt-7 max-w-2xl text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-900 sm:text-6xl lg:text-[68px]">
            Know what’s happening across your stack.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base leading-7 text-slate-600 sm:text-lg">
            A clear operational workspace for uptime, API behavior, security posture, and incident response—without stitching together a dozen tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700">
              Start monitoring free <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={tryDemo} disabled={isStarting} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md disabled:opacity-60">
              {isStarting ? "Preparing live demo..." : "Explore live demo"}
            </button>
            <Link href="/security" className="inline-flex h-11 items-center justify-center rounded-xl px-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900">
              Free security scan
            </Link>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            {["No credit card", "Real network checks", "Workspace-level access"].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />{item}</span>)}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute -inset-5 rounded-[2rem] bg-indigo-100/70 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">V</span><span className="text-sm font-semibold text-slate-900">Command center</span></div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">SAMPLE PREVIEW</span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 sm:p-5">
              {[["Uptime", "99.98%", "Operational"], ["Latency", "142 ms", "Across services"], ["Incidents", "0 open", "Last 24 hours"]].map(([label, value, note]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                  <p className="text-[11px] text-slate-600">{label}</p><p className="mt-2 font-mono text-base font-semibold text-slate-900 sm:text-xl">{value}</p><p className="mt-1 truncate text-[10px] text-slate-600">{note}</p>
                </div>
              ))}
            </div>
            <div className="mx-4 rounded-xl border border-slate-200 p-4 sm:mx-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-slate-900">Response time</p><p className="mt-1 text-[10px] text-slate-600">Illustrative 24-hour service trend</p></div><span className="font-mono text-xs text-indigo-700">P95 188 ms</span></div>
              <div className="mt-5 flex h-28 items-end gap-1.5 sm:h-36">
                {[38,50,45,58,53,70,62,55,74,68,83,72,78,66,88,77,93,76,85,70,82,91,78,98,84,90,75,87,68,81,94,73,88,77,99,86].map((height,index)=><span key={index} className="flex-1 rounded-t-sm bg-indigo-200 transition-colors hover:bg-indigo-500" style={{height:`${height}%`}} />)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-600"><span>24 hours ago</span><span>Now</span></div>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><Activity className="h-3.5 w-3.5" /><span className="font-medium">API Gateway</span><span className="ml-auto">Healthy</span></div>
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800"><ShieldCheck className="h-3.5 w-3.5" /><span className="font-medium">TLS posture</span><span className="ml-auto">Reviewed</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
