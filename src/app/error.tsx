"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-white px-6 text-slate-900"><div className="max-w-md text-center"><p className="font-mono text-xs uppercase tracking-[0.2em] text-rose-700">Runtime exception</p><h1 className="mt-3 text-2xl font-semibold">VigilOps could not complete this request.</h1><button onClick={reset} className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium">Try again</button></div></main>;
}
