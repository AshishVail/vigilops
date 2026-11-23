"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { commandPaletteItems } from "@/components/layout/command-palette-items";

export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const [query,setQuery] = useState("");
  const items = useMemo(() => commandPaletteItems.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase())).slice(0,8), [query]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event)=>{if(event.target===event.currentTarget)setOpen(false);}}><div className="w-full max-w-xl overflow-hidden rounded-xl border border-[#30384a] bg-[#0E121A] shadow-2xl"><div className="flex h-14 items-center gap-3 border-b border-[#1F2633] px-4"><Search className="h-4 w-4 text-slate-500"/><input autoFocus value={query} onChange={(event)=>setQuery(event.target.value)} onKeyDown={(event)=>{if(event.key==="Escape")setOpen(false);if(event.key==="Enter"&&items[0]){router.push(items[0].href);setOpen(false);}}} placeholder="Jump to..." className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"/><kbd className="rounded border border-[#30384a] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">ESC</kbd></div><div className="p-2">{items.map((item)=>{const Icon=item.icon;return <button key={item.href} onClick={()=>{router.push(item.href);setOpen(false);}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04]"><span className="grid h-8 w-8 place-items-center rounded-md border border-[#1F2633] bg-[#090B10]"><Icon className="h-4 w-4 text-violet-300"/></span><span><span className="block text-sm">{item.label}</span><span className="block text-xs text-slate-500">{item.description}</span></span></button>;})}{items.length===0&&<p className="px-3 py-8 text-center text-sm text-slate-500">No matching commands</p>}</div></div></div>;
}
