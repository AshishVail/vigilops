import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  return <pre className={cn("overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-600", className)}><code>{children}</code></pre>;
}
