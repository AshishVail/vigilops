"use client";
import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const DialogContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);
export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}
export function DialogContent({ className, children }: { className?: string; children: ReactNode }) {
  const context = useContext(DialogContext);
  if (!context?.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close dialog" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => context.onOpenChange(false)} />
      <div role="dialog" aria-modal="true" className={cn("relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl", className)}>{children}</div>
    </div>
  );
}
export function DialogHeader({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn("mb-4", className)}>{children}</div>; }
export function DialogTitle({ className, children }: { className?: string; children: ReactNode }) { return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>; }
export function DialogDescription({ className, children }: { className?: string; children: ReactNode }) { return <p className={cn("mt-1 text-sm text-slate-600", className)}>{children}</p>; }
export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn("mt-6 flex justify-end gap-2", className)}>{children}</div>; }
