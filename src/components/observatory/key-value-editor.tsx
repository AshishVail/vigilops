"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { DraftParam } from "@/stores/observatory-store";

export function KeyValueEditor({
  value,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: {
  value: DraftParam[];
  onChange: (value: DraftParam[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const rows = value.length ? value : [{ key: "", value: "", enabled: true }];
  function update(index: number, patch: Partial<DraftParam>) {
    const next = rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row);
    onChange(next);
  }
  function remove(index: number) {
    const next = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(next);
  }
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-[32px_1fr_1fr_32px] gap-2">
          <div className="flex items-center justify-center"><Checkbox checked={row.enabled} onChange={(event) => update(index, { enabled: event.target.checked })}/></div>
          <Input value={row.key} onChange={(event) => update(index, { key: event.target.value })} placeholder={keyPlaceholder} className="font-mono text-xs"/>
          <Input value={row.value} onChange={(event) => update(index, { value: event.target.value })} placeholder={valuePlaceholder} className="font-mono text-xs"/>
          <Button variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove row">×</Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...rows, { key: "", value: "", enabled: true }])}>Add row</Button>
    </div>
  );
}
