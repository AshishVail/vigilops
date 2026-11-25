"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Bell, Gauge, Globe2, Logs, Menu, Settings, ShieldCheck, Sparkles, X } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

const items = [
  ["Command Center","/dashboard",Gauge],["Monitors","/monitors",Activity],["Observatory","/observatory",Globe2],["Security","/security",ShieldCheck],["Incidents","/incidents",AlertTriangle],["Alerts","/alerts",Bell],["Logs","/logs",Logs],["AI Doctor","/ai",Sparkles],["Settings","/settings",Settings],
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);
  return (
    <>
      <button aria-label="Open navigation" onClick={() => setOpen(true)} className="fixed left-4 top-3 z-50 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white lg:hidden"><Menu className="h-5 w-5" /></button>
      {open && <div className="fixed inset-0 z-[60] lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} /><aside className="absolute bottom-0 left-0 top-0 w-[280px] border-r border-slate-200 bg-slate-50 p-4"><div className="mb-5 flex h-10 items-center justify-between"><span className="font-semibold">VigilOps</span><button aria-label="Close" onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-600" /></button></div><nav className="space-y-1">{items.map(([label,href,Icon])=>{const active=pathname===href||pathname.startsWith(`${href}/`);return <Link key={href} href={href} onClick={()=>setOpen(false)} className={cn("flex h-10 items-center gap-3 rounded-lg px-3 text-sm",active?"bg-violet-500/10 text-violet-700":"text-slate-600 hover:bg-slate-100")}><Icon className="h-4 w-4"/>{label}</Link>;})}</nav></aside></div>}
    </>
  );
}
