"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Bell, Gauge, Globe2, Logs, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { label: "Command Center", href: "/dashboard", icon: Gauge },
  { label: "Monitors", href: "/monitors", icon: Activity },
  { label: "Observatory", href: "/observatory", icon: Globe2 },
  { label: "Security", href: "/security", icon: ShieldCheck },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Logs", href: "/logs", icon: Logs },
  { label: "AI Doctor", href: "/ai", icon: Sparkles },
];

export function AppSidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);
  const workspaceSlug = useWorkspaceStore((state) => state.workspaceSlug);
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-slate-50 transition-[width] lg:block", collapsed ? "w-[72px]" : "w-[248px]")}>
      <div className="flex h-16 items-center border-b border-slate-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-violet-500/40 bg-violet-500/10 text-xs font-bold text-violet-700">V</span>
          {!collapsed && <span className="font-semibold">VigilOps</span>}
        </Link>
      </div>
      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={cn("flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition", active ? "bg-violet-500/10 text-violet-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800")}>{collapsed ? <Icon className="mx-auto h-4 w-4" /> : <><Icon className="h-4 w-4" /><span>{item.label}</span></>}</Link>;
        })}
      </nav>
      <div className="absolute bottom-3 left-0 right-0 p-3">
        {!collapsed && <Link href="/settings" className="mb-3 block rounded-xl border border-indigo-100 bg-white p-3 shadow-sm transition hover:border-indigo-200 hover:shadow-md"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-700">Current workspace</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{workspaceSlug?.replaceAll("-", " ") ?? "Loading workspace"}</p><p className="mt-1 text-[11px] text-slate-600">Manage members and services</p></Link>}
        <Link href="/settings" className={cn("flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-slate-600 hover:bg-slate-100", pathname.startsWith("/settings") && "bg-violet-500/10 text-violet-700")}>{collapsed ? <Settings className="mx-auto h-4 w-4" /> : <><Settings className="h-4 w-4" /><span>Settings</span></>}</Link>
        <button onClick={toggle} className="mt-2 h-8 w-full rounded-md text-xs text-slate-600 hover:text-slate-600">{collapsed ? "»" : "« Collapse"}</button>
      </div>
    </aside>
  );
}
