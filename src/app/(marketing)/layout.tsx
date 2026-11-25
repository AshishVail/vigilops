import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-violet-500/40 bg-violet-500/10 text-xs text-violet-700">V</span>
            VigilOps
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 lg:flex">
            <a href="#features" className="transition hover:text-indigo-700">Features</a>
            <a href="#how-it-works" className="transition hover:text-indigo-700">How it works</a>
            <a href="#security" className="transition hover:text-indigo-700">Security</a>
            <a href="#architecture" className="transition hover:text-indigo-700">Architecture</a>
            <a href="#faq" className="transition hover:text-indigo-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:block">Sign in</Link>
            <Link href="#demo" className="hidden rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:block">Try live demo</Link>
            <Link href="/signup" className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Get started</Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
