import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function Radio({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className={cn("h-4 w-4 border-[#30384a] bg-[#0E121A] accent-violet-600", className)} {...props} />;
}
