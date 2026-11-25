import type { SecurityScan } from "@/lib/types/security";

export function HeaderCheckGrid({ scan }: { scan: SecurityScan }) {
  const headers = typeof scan.headers === "object" && scan.headers && !Array.isArray(scan.headers)
    ? scan.headers as Record<string, unknown>
    : {};
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Security headers</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.entries(headers).map(([name,value])=>(
          <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-600">{name}</span>
            <span className={`h-2 w-2 shrink-0 rounded-full ${value?"bg-emerald-500":"bg-rose-500"}`}/>
          </div>
        ))}
      </div>
    </article>
  );
}
