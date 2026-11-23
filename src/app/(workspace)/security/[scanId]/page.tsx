"use client";

import { use } from "react";
import { useSecurityScan } from "@/hooks/use-security-scans";
import { SecurityScore } from "@/components/security/security-score";
import { CertificateCard } from "@/components/security/certificate-card";
import { HeaderCheckGrid } from "@/components/security/header-check-grid";
import { FindingsTable } from "@/components/security/findings-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function SecurityScanDetailPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = use(params);
  const scan = useSecurityScan(scanId);
  if (scan.isLoading) return <div className="p-5 lg:p-8"><Skeleton className="h-96"/></div>;
  if (!scan.data) return <div className="p-5 lg:p-8 text-sm text-slate-500">Security scan not found.</div>;
  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Security report</p><h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight">{scan.data.domain}</h1><p className="mt-1 text-xs text-slate-600">Scanned {new Date(scan.data.scanned_at).toLocaleString()}</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[260px_1fr]"><SecurityScore scan={scan.data}/><CertificateCard scan={scan.data}/></div>
      <HeaderCheckGrid scan={scan.data}/>
      <FindingsTable scan={scan.data}/>
    </div>
  );
}
