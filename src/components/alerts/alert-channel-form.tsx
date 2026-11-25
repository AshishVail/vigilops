"use client";

import { useState } from "react";
import { useCreateAlertChannel } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AlertChannelForm({ workspaceId, projectId, onCreated }: { workspaceId: string; projectId?: string | null; onCreated?: () => void }) {
  const create = useCreateAlertChannel();
  const [type, setType] = useState<"discord" | "slack" | "email">("discord");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [onDown, setOnDown] = useState(true);
  const [onRecovery, setOnRecovery] = useState(true);

  async function submit() {
    await create.mutateAsync({ workspaceId, projectId: projectId ?? null, type, name, destination, isActive: true, onDown, onRecovery });
    setName("");
    setDestination("");
    onCreated?.();
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="alert-name">Channel name</Label><Input id="alert-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Production alerts"/></div>
        <div className="space-y-2"><Label htmlFor="alert-type">Provider</Label><Select id="alert-type" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="discord">Discord</option><option value="slack">Slack</option><option value="email">Email</option></Select></div>
      </div>
      <div className="space-y-2"><Label htmlFor="alert-destination">{type === "email" ? "Recipient email" : "Webhook URL"}</Label><Input id="alert-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={type === "email" ? "alerts@example.com" : "https://..."}/></div>
      <div className="flex flex-wrap gap-6 border-t border-slate-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">Down <Switch checked={onDown} onClick={() => setOnDown((value) => !value)} aria-label="Alert on down"/></label>
        <label className="flex items-center gap-2 text-sm text-slate-600">Recovery <Switch checked={onRecovery} onClick={() => setOnRecovery((value) => !value)} aria-label="Alert on recovery"/></label>
      </div>
      <div className="flex justify-end"><Button disabled={!name.trim() || !destination.trim() || create.isPending} onClick={submit}>{create.isPending ? "Creating..." : "Create channel"}</Button></div>
    </div>
  );
}
