"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const TabsContext = createContext<{ value: string; setValue: (value: string) => void } | null>(null);
export function Tabs({ defaultValue, value: controlled, onValueChange, className, children }: { defaultValue?: string; value?: string; onValueChange?: (value: string) => void; className?: string; children: ReactNode }) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ?? internal;
  const setValue = (next: string) => { setInternal(next); onValueChange?.(next); };
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}
export function TabsList({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn("inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white p-1", className)}>{children}</div>; }
export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  const active = context?.value === value;
  return <button type="button" onClick={() => context?.setValue(value)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition", active && "bg-indigo-600 text-white", className)}>{children}</button>;
}
export function TabsContent({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  return context?.value === value ? <div className={cn("mt-3", className)}>{children}</div> : null;
}
