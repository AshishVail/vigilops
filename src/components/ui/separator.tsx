import { cn } from "@/lib/utils/cn";
export function Separator({ className, vertical = false }: { className?: string; vertical?: boolean }) {
  return <div aria-hidden className={cn(vertical ? "h-full w-px" : "h-px w-full", "bg-[#E2E8F0]", className)} />;
}
