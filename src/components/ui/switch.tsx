import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function Switch({ checked, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }) {
  return <button role="switch" aria-checked={checked} className={cn("relative h-5 w-9 rounded-full border transition", checked ? "border-violet-500 bg-violet-600" : "border-[#30384a] bg-[#181C27]", className)} {...props}><span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} /></button>;
}
