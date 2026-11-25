import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) =>
  <input ref={ref} type="checkbox" className={cn("h-4 w-4 rounded border-slate-200 bg-white accent-violet-600", className)} {...props} />,
);
Checkbox.displayName = "Checkbox";
