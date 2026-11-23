"use client";
import { ChevronDown } from "lucide-react";
export function ProjectSwitcher() {
  return <button className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-slate-400 hover:bg-white/[0.04]"><span className="max-w-32 truncate">Core Platform</span><ChevronDown className="h-3.5 w-3.5 text-slate-600"/></button>;
}
