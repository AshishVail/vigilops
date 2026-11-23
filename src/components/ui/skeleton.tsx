import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-white/[0.055]", className)} {...props} />;
}
