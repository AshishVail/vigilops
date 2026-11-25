import type { PublicStatusData } from "@/lib/status/public-query";
import { StatusDot } from "@/components/ui/status-dot";

export function StatusHeader({ status }: { status: PublicStatusData }) {
  const dotStatus = status.overallStatus === "operating" ? "healthy" : status.overallStatus;
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-7 lg:px-8">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-500/40 bg-violet-500/10 font-semibold text-violet-700">V</span><div><p className="font-semibold">{status.name}</p><p className="font-mono text-[10px] text-slate-600">VigilOps Status</p></div></div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"><StatusDot status={dotStatus}/><span className="capitalize">{dotStatus}</span></div>
      </div>
    </header>
  );
}
