"use client";

import { useState } from "react";
import type { NormalizedLog } from "@/lib/logs/normalize";
import type { LogFilters } from "@/hooks/use-logs";
import { LogFilters as LogFilterControls } from "@/components/logs/log-filters";
import { LogTable } from "@/components/logs/log-table";
import { LogDetailSheet } from "@/components/logs/log-detail-sheet";
import { ExportMenu } from "@/components/logs/export-menu";

export function LogExplorer({ filters, onFiltersChange, logs, loading }: { filters: LogFilters; onFiltersChange: (filters: LogFilters)=>void; logs: NormalizedLog[]; loading: boolean }) {
  const [selected,setSelected] = useState<NormalizedLog|null>(null);
  const [sheetOpen,setSheetOpen] = useState(false);
  function select(log: NormalizedLog) { setSelected(log); setSheetOpen(true); }
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><LogFilterControls value={filters} onChange={onFiltersChange}/><ExportMenu filters={filters}/></div>
      {loading ? <div className="h-96 animate-pulse rounded-xl border border-[#1F2633] bg-[#0E121A]"/> : <LogTable logs={logs} onSelect={select}/>}
      <LogDetailSheet log={selected} open={sheetOpen} onOpenChange={setSheetOpen}/>
    </div>
  );
}
