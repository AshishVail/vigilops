"use client";

import type { Monitor } from "@/lib/types/monitor";
import { MonitorCard } from "@/components/monitors/monitor-card";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export function MonitorList({ monitors }: { monitors: Monitor[] }) {
  if (monitors.length === 0) return <EmptyState title="No monitors configured" description="Create a live HTTP monitor for your first service." action={<Link href="/monitors/new" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium">Create monitor</Link>} />;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{monitors.map((monitor)=><MonitorCard key={monitor.id} monitor={monitor}/>)}</div>;
}
