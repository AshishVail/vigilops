"use client";
import { Search } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function AppHeader() {
  const { setOpen } = useCommandPalette();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1F2633] bg-[#07090D]/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="hidden items-center gap-2 lg:flex"><WorkspaceSwitcher /><span className="text-slate-700">/</span><ProjectSwitcher /></div>
      <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 text-sm text-slate-500 lg:mx-auto lg:w-64"><Search className="h-4 w-4" /><span className="hidden sm:inline">Search or jump...</span><kbd className="ml-auto rounded border border-[#30384a] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd></button>
      <UserMenu />
    </header>
  );
}
