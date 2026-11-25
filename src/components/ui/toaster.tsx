"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Toast } from "@/components/ui/toast";

const ToastContext = createContext<{ toasts: Toast[]; toast: (toast: Omit<Toast, "id">) => void } | null>(null);
export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = (value: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, ...value }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 5000);
  };
  return <ToastContext.Provider value={{ toasts, toast }}>{children}</ToastContext.Provider>;
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within Toaster");
  return context;
}
export function Toaster() {
  const context = useContext(ToastContext);
  if (!context) return null;
  return <div className="fixed bottom-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">{context.toasts.map((toast) => <div key={toast.id} className={`rounded-lg border p-4 shadow-xl ${toast.variant === "danger" ? "border-rose-500/30 bg-rose-950/90" : toast.variant === "success" ? "border-emerald-500/30 bg-emerald-950/90" : "border-slate-200 bg-white"}`}><p className="text-sm font-medium">{toast.title}</p>{toast.description && <p className="mt-1 text-xs text-slate-600">{toast.description}</p>}</div>)}</div>;
}
