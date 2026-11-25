import { cn } from "@/lib/utils/cn";
export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const bounded = Math.min(100, Math.max(0, value));
  return <div className={cn("h-2 overflow-hidden rounded-full bg-indigo-600", className)}><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${bounded}%` }} /></div>;
}
