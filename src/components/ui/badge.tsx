import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "danger" | "violet" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-[#1F2633] bg-white/[0.03] text-slate-300",
        variant === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        variant === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-300",
        variant === "danger" && "border-rose-500/20 bg-rose-500/10 text-rose-300",
        variant === "violet" && "border-violet-500/20 bg-violet-500/10 text-violet-300",
        className,
      )}
      {...props}
    />
  );
}
