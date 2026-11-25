"use client";

import { Textarea } from "@/components/ui/textarea";

export function BodyEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><span className="text-xs text-slate-600">JSON or text</span><span className="font-mono text-[10px] text-slate-600">{new Blob([value]).size} bytes</span></div>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[320px] resize-y font-mono text-xs leading-6" spellCheck={false}/>
    </div>
  );
}
