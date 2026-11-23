"use client";

import { CopyButton } from "@/components/ui/copy-button";

export function RequestIdCopy({ requestId }: { requestId: string | null }) {
  if (!requestId) return <span className="text-slate-600">—</span>;
  return <CopyButton value={requestId} label={requestId.slice(0, 8)} />;
}
