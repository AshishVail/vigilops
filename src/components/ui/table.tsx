import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>; }
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} />; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-b border-[#1F2633] transition-colors hover:bg-white/[0.025]", className)} {...props} />; }
export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-10 px-3 text-left text-xs font-medium text-slate-500", className)} {...props} />; }
export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) { return <td className={cn("px-3 py-3 text-slate-300", className)} {...props} />; }
