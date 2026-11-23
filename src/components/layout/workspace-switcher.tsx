"use client";
import { ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
export function WorkspaceSwitcher() {
  const slug = useWorkspaceStore((state) => state.workspaceSlug);
  return <button className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-slate-300 hover:bg-white/[0.04]"><span className="grid h-5 w-5 place-items-center rounded-md bg-violet-600 text-[10px] text-white">{slug?.[0]?.toUpperCase() ?? "V"}</span><span className="max-w-32 truncate">{slug ? slug.replaceAll("-"," ") : "Workspace"}</span><ChevronDown className="h-3.5 w-3.5 text-slate-600"/></button>;
}
