"use client";
export default function PublicStatusError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-white text-slate-900"><div className="text-center"><h1 className="text-2xl font-semibold">Status unavailable</h1><p className="mt-2 text-sm text-slate-600">The public status page could not be loaded.</p><button onClick={reset} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm">Retry</button></div></main>;
}
