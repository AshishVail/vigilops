"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoMode } from "@/hooks/use-demo-mode";

export function LiveDemoCta() {
  const router = useRouter();
  const { startDemo, isStarting } = useDemoMode();
  const [error, setError] = useState("");
  async function start() {
    setError("");
    try {
      await startDemo();
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start demo");
    }
  }
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-[linear-gradient(135deg,#0E121A,#11101a)] px-6 py-12 text-center sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,.24),transparent_18rem)]" />
        <div className="relative">
          <p className="font-mono text-xs text-cyan-400">LIVE SANDBOX</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Explore the production experience.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Recruiters and operators get a read/write demo workspace with realistic history. No account required.</p>
          <button onClick={start} disabled={isStarting} className="mt-7 h-11 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white disabled:opacity-60">{isStarting ? "Creating sandbox..." : "Enter Live Demo"}</button>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        </div>
      </div>
    </section>
  );
}
