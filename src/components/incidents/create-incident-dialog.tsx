"use client";

import { useState } from "react";
import { useCreateIncident } from "@/hooks/use-incidents";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateIncidentDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (open: boolean) => void; projectId: string }) {
  const create = useCreateIncident();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  async function submit() {
    await create.mutateAsync({ projectId, title, summary: summary || undefined, severity });
    setTitle("");
    setSummary("");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create incident</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="incident-title">Title</Label><Input id="incident-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="incident-summary">Summary</Label><Textarea id="incident-summary" value={summary} onChange={(event) => setSummary(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="incident-severity">Severity</Label><Select id="incident-severity" value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!title.trim() || create.isPending} onClick={submit}>{create.isPending ? "Creating..." : "Create incident"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
