import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) =>
  <select ref={ref} className={cn("h-9 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 text-sm text-slate-100 focus:border-violet-500/70 focus:outline-none", className)} {...props}>{children}</select>,
);
Select.displayName = "Select";
