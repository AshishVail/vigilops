"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <section className="relative overflow-hidden border-b border-[#1F2633]/70">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,.22),transparent_30rem)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 text-center lg:px-8 lg:py-36">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1.5 font-mono text-xs text-violet-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live DevOps observability
        </div>
        <h1 className="mx-auto mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-6xl lg:text-[82px]">
          Every signal.<br /><span className="text-slate-500">One operational layer.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-slate-400 sm:text-lg">
          Monitor infrastructure, test APIs, inspect security posture, and resolve incidents from one focused workspace.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={tryDemo} disabled={isStarting} className="h-11 w-full rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(124,58,237,.22)] transition hover:bg-violet-500 disabled:opacity-60 sm:w-auto">
            {isStarting ? "Preparing live demo..." : "Try Live Demo"}
          </button>
          <Link href="/signup" className="h-11 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-5 text-sm font-medium leading-[44px] text-slate-200 transition hover:border-[#30384a] sm:w-auto">Create workspace</Link>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-rose-400">{error}</p>}
        <p className="mt-4 font-mono text-[11px] text-slate-600">NO SIGNUP · ISOLATED SANDBOX · AUTO-EXPIRING</p>
      </div>
    </section>
  );
}
