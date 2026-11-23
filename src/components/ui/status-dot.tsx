import { cn } from "@/lib/utils/cn";

export function StatusDot({ status = "healthy", className }: { status?: "healthy" | "degraded" | "down" | "paused"; className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2 rounded-full", status === "healthy" && "bg-emerald-500", status === "degraded" && "bg-amber-500", status === "down" && "bg-rose-500", status === "paused" && "bg-slate-500", className)}>
      {status !== "paused" && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-40", status === "healthy" && "bg-emerald-500", status === "degraded" && "bg-amber-500", status === "down" && "bg-rose-500")} />}
    </span>
  );
}
