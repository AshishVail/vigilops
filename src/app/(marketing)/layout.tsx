import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-[#1F2633]/80 bg-[#07090D]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-violet-500/40 bg-violet-500/10 text-xs text-violet-300">V</span>
            VigilOps
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a href="#features" className="hover:text-slate-100">Platform</a>
            <a href="#architecture" className="hover:text-slate-100">Architecture</a>
            <a href="mailto:contact@nexovent.tech" className="hover:text-slate-100">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white sm:block">Sign in</Link>
            <Link href="/signup" className="rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,.18)]">Get started</Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
