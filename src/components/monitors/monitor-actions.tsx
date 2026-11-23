"use client";

import { useRouter } from "next/navigation";
import { useDeleteMonitor, usePingMonitor, useUpdateMonitor } from "@/hooks/use-monitors";
import type { Monitor } from "@/lib/types/monitor";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

export function MonitorActions({ monitor }: { monitor: Monitor }) {
  const router = useRouter();
  const ping = usePingMonitor();
  const update = useUpdateMonitor();
  const remove = useDeleteMonitor();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => ping.mutate(monitor.id)} disabled={ping.isPending}>{ping.isPending ? "Pinging..." : "Ping now"}</Button>
      <Button variant="outline" onClick={() => router.push(`/monitors/${monitor.id}/edit`)}>Edit</Button>
      <Button variant="outline" onClick={() => update.mutateAsync({ monitorId: monitor.id, isActive: !monitor.is_active })}>{monitor.is_active ? "Pause" : "Resume"}</Button>
      <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete monitor" description={`This permanently removes ${monitor.name} and its ping history.`} confirmLabel="Delete monitor" destructive onConfirm={() => remove.mutate(monitor.id)} />
    </div>
  );
}
