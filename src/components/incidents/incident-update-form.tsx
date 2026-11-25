"use client";

import { useState } from "react";
import { useAddIncidentUpdate } from "@/hooks/use-incidents";
import type { Incident } from "@/lib/types/incident";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function IncidentUpdateForm({ incident }: { incident: Incident }) {
  const update = useAddIncidentUpdate();
  const [status, setStatus] = useState<Incident["status"]>(incident.status);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-2">
        <Label htmlFor="incident-status">Workflow status</Label>
        <Select id="incident-status" value={status} onChange={(event) => setStatus(event.target.value as Incident["status"])}>
          <option value="investigating">Investigating</option>
          <option value="identified">Identified</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="incident-message">Timeline update</Label><Textarea id="incident-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add findings or next actions..." /></div>
      <div className="flex justify-end"><Button disabled={update.isPending} onClick={() => update.mutate({ incidentId: incident.id, status, message: message.trim() || undefined })}>{update.isPending ? "Updating..." : "Add update"}</Button></div>
    </div>
  );
}
