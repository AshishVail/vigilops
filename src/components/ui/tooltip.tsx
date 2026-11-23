import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function Tooltip({ children, content, className }: { children: ReactNode; content: ReactNode; className?: string }) {
  return <span className="group relative inline-flex">{children}<span role="tooltip" className={cn("pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[#1F2633] bg-[#111620] px-2 py-1 text-xs text-slate-200 shadow-lg group-hover:block", className)}>{content}</span></span>;
}
