import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function EmptyState({ title, description, action, className }: { title: string; description: string; action?: ReactNode; className?: string }) {
  return <div className={cn("flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[#1F2633] bg-[#0E121A]/50 px-6 text-center", className)}><div className="mb-4 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,.8)]" /><h3 className="text-sm font-semibold text-slate-200">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}
