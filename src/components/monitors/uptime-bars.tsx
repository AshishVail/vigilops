import type { PingLog } from "@/lib/types/monitor";

export function UptimeBars({ logs, count = 90 }: { logs: PingLog[]; count?: number }) {
  const slots = Array.from({ length: count }, (_, index) => logs[index] ?? null);
  return (
    <div className="flex h-12 items-end gap-[3px]" aria-label="Recent uptime bars">
      {slots.map((log, index) => {
        const status = log?.status;
        const color = !log ? "bg-[#181C27]" : status === "success" ? "bg-emerald-500" : status === "timeout" ? "bg-amber-500" : "bg-rose-500";
        return <span key={index} title={log ? `${status} · ${log.latency_ms} ms` : "No check"} className={`h-full flex-1 rounded-sm ${color} opacity-${log ? "100" : "50"}`} />;
      })}
    </div>
  );
}
