"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body className="grid min-h-screen place-items-center bg-[#07090D] text-slate-100"><div className="text-center"><h1 className="text-2xl font-semibold">VigilOps is unavailable</h1><button onClick={reset} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm">Reload</button></div></body></html>;
}
