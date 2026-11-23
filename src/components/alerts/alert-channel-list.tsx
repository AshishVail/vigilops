import type { AlertChannel } from "@/lib/types/alert";
import { AlertChannelCard } from "@/components/alerts/alert-channel-card";
import { EmptyState } from "@/components/ui/empty-state";

export function AlertChannelList({ channels, onChanged }: { channels: AlertChannel[]; onChanged?: () => void }) {
  if (channels.length === 0) {
    return <EmptyState title="No alert channels" description="Add Discord, Slack, or email delivery to receive incident notifications." />;
  }
  return <div className="grid gap-4 lg:grid-cols-2">{channels.map((channel) => <AlertChannelCard key={channel.id} channel={channel} onChanged={onChanged}/>)}</div>;
}
