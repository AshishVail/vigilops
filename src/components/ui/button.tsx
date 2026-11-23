import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-[#7C3AED] text-white hover:bg-[#8B5CF6]",
        variant === "secondary" && "bg-[#181C27] text-slate-100 hover:bg-[#222738]",
        variant === "outline" && "border border-[#1F2633] bg-[#0E121A] text-slate-200 hover:border-[#30384a]",
        variant === "ghost" && "text-slate-300 hover:bg-white/[0.05] hover:text-white",
        variant === "danger" && "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-11 px-5 text-sm",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
