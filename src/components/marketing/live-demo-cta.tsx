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
    <section id="demo" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-12 pt-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-6 py-12 text-center shadow-sm sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,.12),transparent_18rem)]" />
        <div className="relative">
          <p className="font-mono text-xs text-cyan-700">LIVE SANDBOX · NO SIGNUP</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Explore the product with a real sandbox.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Try the workspace using an isolated, expiring demo environment. Create and explore records without connecting production services.</p>
          <button onClick={start} disabled={isStarting} className="mt-7 h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">{isStarting ? "Creating sandbox..." : "Enter live demo"}</button>
          {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        </div>
      </div>
    </section>
  );
}
