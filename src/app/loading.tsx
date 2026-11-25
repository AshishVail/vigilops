export default function Loading() {
  return <div className="min-h-screen bg-white p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-4"><div className="h-8 w-48 rounded-lg bg-white/[0.06]" /><div className="h-40 rounded-xl border border-slate-200 bg-white" /><div className="grid gap-4 md:grid-cols-3">{[0,1,2].map((item)=><div key={item} className="h-28 rounded-xl border border-slate-200 bg-white" />)}</div></div></div>;
}
