"use client";
import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function DemoBanner() {
  const { user } = useSupabase();
  const { resetDemo, isResetting } = useDemoMode();
  const [visible,setVisible] = useState(true);
  const workspaceId = useWorkspaceStore((state)=>state.workspaceId);
  if (!visible || !user?.is_anonymous) return null;
  return <div className="flex min-h-10 items-center justify-between gap-3 border-b border-violet-500/15 bg-violet-500/[0.055] px-4 py-2 text-xs text-violet-700 lg:px-6"><span><span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>Guest Demo · read/write sandbox</span><div className="flex items-center gap-2"><button disabled={isResetting} onClick={()=>resetDemo(workspaceId ?? undefined)} className="rounded-md border border-violet-500/20 px-2 py-1 hover:bg-violet-500/10 disabled:opacity-50">{isResetting?"Resetting...":"Reset"}</button><button onClick={()=>setVisible(false)} className="text-slate-600 hover:text-slate-600">Dismiss</button></div></div>;
}
