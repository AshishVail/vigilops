import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function Radio({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className={cn("h-4 w-4 border-slate-200 bg-white accent-violet-600", className)} {...props} />;
}
