"use client";

import type { AlertChannel } from "@/lib/types/alert";
import { useDeleteAlertChannel, useTestAlertChannel, useUpdateAlertChannel } from "@/hooks/use-alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function AlertChannelCard({ channel, onChanged }: { channel: AlertChannel; onChanged?: () => void }) {
  const update = useUpdateAlertChannel();
  const remove = useDeleteAlertChannel();
  const test = useTestAlertChannel();
  return (
    <article className="rounded-xl border border-[#1F2633] bg-[#0E121A] p-5">
      <div className="flex items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{channel.name}</h3><Badge variant={channel.is_active ? "success" : "default"}>{channel.is_active ? "Active" : "Paused"}</Badge></div><p className="mt-2 font-mono text-xs text-slate-500">{channel.type} · {channel.destination === "[encrypted]" ? "Encrypted destination" : channel.destination}</p></div>
        <Switch checked={channel.is_active} onClick={() => { void update.mutateAsync({ alertId: channel.id, isActive: !channel.is_active }).then(onChanged); }} aria-label={`Toggle ${channel.name}`}/>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#1F2633] pt-4">
        <Button size="sm" variant="outline" disabled={test.isPending} onClick={() => test.mutate(channel.id)}>{test.isPending ? "Testing..." : "Test"}</Button>
        <Button size="sm" variant="danger" onClick={() => { void remove.mutateAsync(channel.id).then(onChanged); }}>Delete</Button>
      </div>
    </article>
  );
}
