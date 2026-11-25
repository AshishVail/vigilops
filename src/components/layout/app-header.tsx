"use client";
import { AlertTriangle, Globe2, Plus, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const router = useRouter();
  const { setOpen } = useCommandPalette();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-xl lg:px-6">
      <div className="hidden items-center gap-2 lg:flex"><WorkspaceSwitcher /><span className="text-slate-600">/</span><ProjectSwitcher /></div>
      <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 lg:mx-auto lg:w-64"><Search className="h-4 w-4" /><span className="hidden sm:inline">Search or jump...</span><kbd className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd></button>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger><button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Create</span></button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => router.push("/monitors/new")}>New monitor</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/security")}><ShieldCheck className="mr-2 h-4 w-4" />Run security scan</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/observatory")}><Globe2 className="mr-2 h-4 w-4" />Open API observatory</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/incidents")}><AlertTriangle className="mr-2 h-4 w-4" />Create incident</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserMenu />
      </div>
    </header>
  );
}
