"use client";
export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-[70vh] items-center justify-center px-6"><div className="max-w-md text-center"><p className="font-mono text-xs uppercase tracking-[.2em] text-rose-400">Workspace error</p><h1 className="mt-3 text-xl font-semibold">The operational surface could not be loaded.</h1><button onClick={reset} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm">Retry</button></div></main>;
}
