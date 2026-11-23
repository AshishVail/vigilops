import Link from "next/link";
export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#07090D] px-6 text-slate-100"><div className="text-center"><p className="font-mono text-sm text-violet-400">404</p><h1 className="mt-3 text-3xl font-semibold">Signal lost</h1><p className="mt-2 text-sm text-slate-500">This page is outside the monitored surface.</p><Link href="/" className="mt-6 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium">Return home</Link></div></main>;
}
