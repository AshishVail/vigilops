"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LogFilters } from "@/hooks/use-logs";

export function ExportMenu({ filters }: { filters: LogFilters }) {
  const [exporting,setExporting] = useState(false);
  async function exportLogs(format: "csv" | "json") {
    if (!filters.projectId) return;
    setExporting(true);
    const params = new URLSearchParams({ projectId: filters.projectId, format });
    if (filters.service) params.set("service", filters.service);
    if (filters.statusGroup) params.set("statusGroup", filters.statusGroup);
    if (filters.search) params.set("search", filters.search);
    if (filters.requestId) params.set("requestId", filters.requestId);
    const response = await fetch(`/api/logs/export?${params.toString()}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vigilops-logs.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }
  return <div className="flex gap-2"><Button variant="outline" size="sm" disabled={exporting} onClick={()=>void exportLogs("csv")}>CSV</Button><Button variant="outline" size="sm" disabled={exporting} onClick={()=>void exportLogs("json")}>JSON</Button></div>;
}
