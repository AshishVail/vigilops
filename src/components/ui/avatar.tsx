import type { HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
export function Avatar({ name, src, className }: { name: string; src?: string; className?: string } & HTMLAttributes<HTMLSpanElement>) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase();
  return <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#30384a] bg-[#181C27] text-xs font-semibold text-slate-200", className)}>{src ? <Image src={src} alt={name} width={32} height={32} className="h-full w-full object-cover" /> : initials}</span>;
}
