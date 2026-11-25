import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
export function Pagination({ page, totalPages, onPageChange, className }: { page: number; totalPages: number; onPageChange: (page: number) => void; className?: string }) {
  return <nav aria-label="Pagination" className={cn("flex items-center gap-2", className)}><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span className="font-mono text-xs text-slate-600">{page} / {Math.max(1,totalPages)}</span><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></nav>;
}
