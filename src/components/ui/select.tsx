import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) =>
  <select ref={ref} className={cn("h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-violet-500/70 focus:outline-none", className)} {...props}>{children}</select>,
);
Select.displayName = "Select";
