"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
export function Sheet({ open, onOpenChange, side = "right", children }: { open: boolean; onOpenChange: (open: boolean) => void; side?: "left" | "right"; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50"><button aria-label="Close sheet" className="absolute inset-0 bg-black/70" onClick={() => onOpenChange(false)} /><aside className={cn("absolute top-0 h-full w-full max-w-md border-[#1F2633] bg-[#0E121A] p-5 shadow-2xl", side === "right" ? "right-0 border-l" : "left-0 border-r")}>{children}</aside></div>;
}
export function SheetHeader({ children }: { children: ReactNode }) { return <div className="mb-5">{children}</div>; }
export function SheetTitle({ children }: { children: ReactNode }) { return <h2 className="text-lg font-semibold">{children}</h2>; }
