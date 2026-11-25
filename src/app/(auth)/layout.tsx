import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden border-r border-slate-200 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_80%_75%,rgba(6,182,212,0.08),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-700">V</span>
              VigilOps
            </Link>
            <div className="max-w-xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-cyan-700">Monitor. Test. Secure. Resolve.</p>
              <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">Operational clarity for every service.</h1>
            </div>
            <p className="text-sm text-slate-600">DevOps &amp; API observability for modern infrastructure.</p>
          </div>
        </section>
        <section className="flex min-h-screen items-center justify-center px-6 py-12">{children}</section>
      </div>
    </main>
  );
}
