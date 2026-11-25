import type { SecurityScan } from "@/lib/types/security";

export function SecurityScore({ scan }: { scan: SecurityScan }) {
  const score = Math.max(0, Math.min(100, scan.security_score));
  const circumference = 2 * Math.PI * 54;
  const dash = (score / 100) * circumference;
  const color = score >= 85 ? "#10B981" : score >= 65 ? "#F59E0B" : "#EF4444";
  return (
    <article className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" strokeWidth="8"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circumference-dash}`}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold">{score}</span><span className="mt-1 font-mono text-xs text-slate-600">{scan.grade}</span></div>
      </div>
    </article>
  );
}
