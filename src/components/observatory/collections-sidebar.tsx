"use client";

import { useState } from "react";
import type { ApiCollection, ApiRequest } from "@/lib/types/observatory";
import { useCreateCollection, useDeleteCollection, useCollections } from "@/hooks/use-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CollectionsSidebar({
  projectId,
  onSelectRequest,
}: {
  projectId: string | null;
  onSelectRequest: (request: ApiRequest) => void;
}) {
  const collections = useCollections(projectId);
  const create = useCreateCollection();
  const remove = useDeleteCollection();
  const [name, setName] = useState("");
  async function createCollection() {
    if (!projectId || !name.trim()) return;
    await create.mutateAsync({ projectId, name: name.trim() });
    setName("");
  }
  return (
    <aside className="flex h-full min-h-[640px] flex-col border-r border-[#1F2633] bg-[#090B10]">
      <div className="border-b border-[#1F2633] p-3"><p className="text-xs font-semibold">Collections</p></div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {(collections.data ?? []).map((collection) => (
          <CollectionItem key={collection.id} collection={collection} onSelectRequest={onSelectRequest} onDelete={()=>void remove.mutateAsync(collection.id)} />
        ))}
        {(collections.data?.length ?? 0) === 0 && <p className="py-8 text-center text-xs text-slate-600">No collections</p>}
      </div>
      {projectId && <div className="flex gap-2 border-t border-[#1F2633] p-3"><Input value={name} onChange={(event)=>setName(event.target.value)} placeholder="New collection" className="h-8"/><Button size="sm" disabled={!name.trim() || create.isPending} onClick={createCollection}>+</Button></div>}
    </aside>
  );
}

function CollectionItem({ collection, onSelectRequest, onDelete }: { collection: ApiCollection; onSelectRequest: (request: ApiRequest)=>void; onDelete:()=>void }) {
  const [open,setOpen] = useState(true);
  const [requests,setRequests] = useState<ApiRequest[]>([]);
  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && requests.length === 0) {
      const response = await fetch(`/api/collections/${collection.id}/requests`, { cache:"no-store" });
      const body = await response.json() as { data?: ApiRequest[] };
      if (response.ok) setRequests(body.data ?? []);
    }
  }
  return (
    <div className="rounded-lg border border-transparent hover:border-[#1F2633]">
      <div className="flex items-center gap-2 px-2 py-2"><button onClick={toggle} className="flex-1 text-left text-xs text-slate-300">{open ? "▾" : "▸"} {collection.name}</button><button onClick={onDelete} className="text-xs text-slate-600 hover:text-rose-400" aria-label={`Delete ${collection.name}`}>×</button></div>
      {open && <div className="space-y-1 pb-2 pl-5">{requests.map((request)=><button key={request.id} onClick={()=>onSelectRequest(request)} className="block w-full truncate rounded px-2 py-1.5 text-left font-mono text-[11px] text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"><span className="mr-2 text-violet-400">{request.method}</span>{request.name}</button>)}</div>}
    </div>
  );
}
