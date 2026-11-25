"use client";
import type { DashboardRange } from "@/lib/types/dashboard";

export function DateRangeFilter({ value, onChange }: { value: DashboardRange; onChange: (value: DashboardRange) => void }) {
  const options: Array<{ value: DashboardRange; label: string }> = [
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {options.map((option) => (
        <button key={option.value} onClick={() => onChange(option.value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${value === option.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-600"}`}>{option.label}</button>
      ))}
    </div>
  );
}
