"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function Popover({ trigger, children, className }: { trigger: ReactNode; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)}>{trigger}</button>{open && <div className={cn("absolute right-0 z-40 mt-2 rounded-lg border border-[#1F2633] bg-[#0E121A] p-3 shadow-xl", className)}>{children}</div>}</div>;
}
