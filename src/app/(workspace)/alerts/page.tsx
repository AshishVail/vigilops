"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useAlertChannels } from "@/hooks/use-alerts";
import { AlertChannelForm } from "@/components/alerts/alert-channel-form";
import { AlertChannelList } from "@/components/alerts/alert-channel-list";
import { AlertDeliveryLog } from "@/components/alerts/alert-delivery-log";
import type { AlertDelivery } from "@/lib/types/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AlertsPage() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const projectId = useWorkspaceStore((state) => state.projectId);
  const channels = useAlertChannels(workspaceId);
  const { supabase } = useSupabase();
  const [deliveries, setDeliveries] = useState<AlertDelivery[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    void supabase.from("alert_channels").select("id").eq("workspace_id", workspaceId).then(async ({ data }) => {
      const channelIds = (data ?? []).map((channel) => channel.id);
      if (!active) return;
      if (channelIds.length === 0) {
        setDeliveries([]);
        return;
      }
      const result = await supabase.from("alert_deliveries").select("*").in("channel_id", channelIds).order("attempted_at", { ascending: false }).limit(100);
      if (active && result.data) setDeliveries(result.data);
    });
    return () => { active = false; };
  }, [supabase, workspaceId, channels.data]);

  if (!workspaceId) return <div className="p-5 lg:p-8"><Skeleton className="h-96"/></div>;
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Notifications</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Alert channels</h1></div><Button variant="outline" onClick={() => void channels.refetch()} disabled={channels.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${channels.isFetching ? "animate-spin" : ""}`} />Refresh</Button></div>
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <AlertChannelForm workspaceId={workspaceId} projectId={projectId} onCreated={() => void channels.refetch()}/>
        {channels.isLoading ? <Skeleton className="h-64"/> : <AlertChannelList channels={channels.data ?? []} onChanged={() => void channels.refetch()}/>}
      </div>
      <section><h2 className="mb-3 text-sm font-semibold">Delivery log</h2><AlertDeliveryLog deliveries={deliveries}/></section>
    </div>
  );
}
