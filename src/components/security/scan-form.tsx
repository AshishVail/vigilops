"use client";

import { useState } from "react";
import { useCreateSecurityScan } from "@/hooks/use-security-scans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScanForm({ projectId, onScanned }: { projectId: string; onScanned?: (scanId: string) => void }) {
  const scan = useCreateSecurityScan();
  const [domain, setDomain] = useState("");
  async function submit() {
    if (!domain.trim()) return;
    const result = await scan.mutateAsync({ projectId, domain: domain.trim() });
    setDomain("");
    onScanned?.(result.id);
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-2">
        <Label htmlFor="security-domain">Domain</Label>
        <div className="flex gap-2"><Input id="security-domain" value={domain} onChange={(event)=>setDomain(event.target.value)} placeholder="example.com" className="font-mono text-xs"/><Button onClick={()=>void submit()} disabled={!domain.trim() || scan.isPending}>{scan.isPending ? "Scanning..." : "Run scan"}</Button></div>
      </div>
    </div>
  );
}
