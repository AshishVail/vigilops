import type { SecurityScan } from "@/lib/types/security";

export function CertificateCard({ scan }: { scan: SecurityScan }) {
  const certificate = typeof scan.certificate === "object" && scan.certificate && !Array.isArray(scan.certificate)
    ? scan.certificate as Record<string, unknown>
    : {};
  const valid = certificate.valid === true;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">TLS certificate</h2><span className={`h-2 w-2 rounded-full ${valid?"bg-emerald-500":"bg-rose-500"}`}/></div>
      <dl className="mt-5 space-y-3">
        <div className="flex justify-between gap-4"><dt className="text-xs text-slate-600">Issuer</dt><dd className="max-w-[220px] truncate font-mono text-xs text-slate-600">{String(certificate.issuer ?? "Unknown")}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-xs text-slate-600">Expires</dt><dd className="font-mono text-xs text-slate-600">{certificate.validTo ? new Date(String(certificate.validTo)).toLocaleDateString() : "Unknown"}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-xs text-slate-600">Days remaining</dt><dd className="font-mono text-xs text-slate-600">{String(certificate.daysRemaining ?? "—")}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-xs text-slate-600">Protocol</dt><dd className="font-mono text-xs text-slate-600">{String(certificate.protocol ?? "Unknown")}</dd></div>
      </dl>
    </article>
  );
}
