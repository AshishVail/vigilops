import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) =>
  <input ref={ref} className={cn("h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-600 focus:border-violet-500/70 focus:outline-none focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />,
);
Input.displayName = "Input";
