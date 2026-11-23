"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCollections, useSaveApiRequest } from "@/hooks/use-collections";
import type { HttpMethod, ApiAuth } from "@/lib/types/observatory";
import type { DraftParam } from "@/stores/observatory-store";

export function SaveRequestDialog({
  open,
  onOpenChange,
  projectId,
  method,
  url,
  queryParams,
  headers,
  auth,
  body,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  method: HttpMethod;
  url: string;
  queryParams: DraftParam[];
  headers: DraftParam[];
  auth: ApiAuth;
  body: string;
}) {
  const collections = useCollections(projectId);
  const save = useSaveApiRequest();
  const [name,setName] = useState("");
  const [collectionId,setCollectionId] = useState("");
  async function submit() {
    if (!collectionId || !name.trim()) return;
    await save.mutateAsync({
      collectionId,
      name: name.trim(),
      method,
      url,
      queryParams,
      headers: Object.fromEntries(headers.filter((row)=>row.enabled&&row.key.trim()).map((row)=>[row.key,row.value])),
      auth,
      body: body.trim() ? body : null,
    });
    setName("");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Save API request</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Request name</Label><Input value={name} onChange={(event)=>setName(event.target.value)} placeholder="Get account details"/></div>
          <div className="space-y-2"><Label>Collection</Label><Select value={collectionId} onChange={(event)=>setCollectionId(event.target.value)}><option value="">Select collection</option>{(collections.data ?? []).map((collection)=><option key={collection.id} value={collection.id}>{collection.name}</option>)}</Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button disabled={!name.trim()||!collectionId||save.isPending} onClick={submit}>Save request</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
