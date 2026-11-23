"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
const MenuContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);
export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MenuContext.Provider value={{ open, setOpen }}><div className="relative">{children}</div></MenuContext.Provider>;
}
export function DropdownMenuTrigger({ children }: { children: ReactNode }) { const context = useContext(MenuContext); return <div onClick={() => context?.setOpen(!context.open)} className="cursor-pointer">{children}</div>; }
export function DropdownMenuContent({ children, className }: { children: ReactNode; className?: string }) {
  const context = useContext(MenuContext);
  if (!context?.open) return null;
  return <div className={cn("absolute right-0 top-full z-40 mt-2 min-w-48 rounded-lg border border-[#1F2633] bg-[#0E121A] p-1 shadow-xl", className)} onMouseLeave={() => context.setOpen(false)}>{children}</div>;
}
export function DropdownMenuItem({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  const context = useContext(MenuContext);
  return <button type="button" className={cn("w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.05]", className)} onClick={() => { onClick?.(); context?.setOpen(false); }}>{children}</button>;
}
