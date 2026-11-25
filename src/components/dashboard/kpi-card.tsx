import { StatusDot } from "@/components/ui/status-dot";
import type { KpiMetric } from "@/lib/types/dashboard";

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const dotStatus = metric.status ?? "healthy";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{metric.label}</p>
        <StatusDot status={dotStatus} />
      </div>
      <p className="mt-5 font-mono text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
      {metric.changePercent !== undefined && (
        <p className={`mt-2 text-xs ${metric.changePercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
          {metric.changePercent >= 0 ? "+" : ""}{metric.changePercent.toFixed(1)}% range
        </p>
      )}
    </article>
  );
}
