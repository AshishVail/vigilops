"use client";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { DemoBanner } from "@/components/layout/demo-banner";
import { useUiStore } from "@/stores/ui-store";
import { useWorkspaces } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils/cn";

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  useWorkspaces();

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100">
      <AppSidebar />
      <MobileNav />
      <CommandPalette />
      <div className={cn("min-h-screen transition-[margin] duration-200", collapsed ? "lg:ml-[72px]" : "lg:ml-[248px]")}>
        <AppHeader />
        <DemoBanner />
        <main className="min-h-[calc(100vh-112px)]">{children}</main>
      </div>
    </div>
  );
}
