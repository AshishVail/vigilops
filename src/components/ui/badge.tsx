import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "danger" | "violet" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-slate-200 bg-slate-50 text-slate-600",
        variant === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        variant === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-700",
        variant === "danger" && "border-rose-500/20 bg-rose-500/10 text-rose-700",
        variant === "violet" && "border-violet-500/20 bg-violet-500/10 text-violet-700",
        className,
      )}
      {...props}
    />
  );
}
