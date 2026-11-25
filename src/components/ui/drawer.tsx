"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function Drawer({ open, onOpenChange, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode; className?: string }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close drawer" className="absolute inset-0 bg-black/70" onClick={() => onOpenChange(false)} /><aside className={cn("absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-5", className)}>{children}</aside></div>;
}
