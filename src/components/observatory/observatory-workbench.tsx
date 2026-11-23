"use client";

import { useState } from "react";
import { useObservatoryStore } from "@/stores/observatory-store";
import { useExecuteObservatoryRequest, useObservatoryHistory, useClearObservatoryHistory } from "@/hooks/use-observatory";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/use-project";
import { RequestBar } from "@/components/observatory/request-bar";
import { RequestTabs } from "@/components/observatory/request-tabs";
import { ResponseMeta } from "@/components/observatory/response-meta";
import { ResponseViewer } from "@/components/observatory/response-viewer";
import { CollectionsSidebar } from "@/components/observatory/collections-sidebar";
import { HistoryPanel } from "@/components/observatory/history-panel";
import { SaveRequestDialog } from "@/components/observatory/save-request-dialog";
import { buildCurlCommand } from "@/lib/observatory/curl";
import type { ObservatoryExecutionResult } from "@/lib/observatory/executor";
import type { ApiRequest } from "@/lib/types/observatory";

export function ObservatoryWorkbench() {
  const workspaceId = useWorkspaceStore((state)=>state.workspaceId);
  const projectId = useWorkspaceStore((state)=>state.projectId);
  const projects = useProjects(workspaceId);
  const effectiveProjectId = projectId ?? projects.data?.[0]?.id ?? null;
  const draft = useObservatoryStore((state)=>state.draft);
  const setDraft = useObservatoryStore((state)=>state.setDraft);
  const execute = useExecuteObservatoryRequest();
  const history = useObservatoryHistory(effectiveProjectId);
  const clearHistory = useClearObservatoryHistory();
  const [response,setResponse] = useState<ObservatoryExecutionResult|null>(null);
  const [saveOpen,setSaveOpen] = useState(false);

  function toHeaders() {
    return Object.fromEntries(draft.headers.filter((row)=>row.enabled&&row.key.trim()).map((row)=>[row.key,row.value]));
  }
  async function send() {
    if (!effectiveProjectId) return;
    let body: string | Record<string, unknown> | unknown[] | null = draft.body;
    if (draft.body.trim()) {
      try { body = JSON.parse(draft.body); } catch { body = draft.body; }
    } else body = null;
    const result = await execute.mutateAsync({
      projectId: effectiveProjectId,
      method: draft.method,
      url: draft.url,
      queryParams: draft.queryParams,
      headers: toHeaders(),
      auth: draft.auth,
      body,
      timeoutMs: 10000,
    });
    setResponse(result.response);
  }
  async function copyCurl() {
    const command = buildCurlCommand({
      method: draft.method,
      url: draft.url,
      queryParams: draft.queryParams,
      headers: toHeaders(),
      body: draft.body,
    });
    await navigator.clipboard.writeText(command);
  }
  function selectRequest(request: ApiRequest) {
    setDraft({
      method: request.method as typeof draft.method,
      url: request.url,
      queryParams: Array.isArray(request.query_params) ? request.query_params as typeof draft.queryParams : [],
      headers: typeof request.headers === "object" && request.headers && !Array.isArray(request.headers) ? Object.entries(request.headers).map(([key,value])=>({key,value:String(value),enabled:true})) : [],
      auth: typeof request.auth === "object" && request.auth ? request.auth as typeof draft.auth : {type:"none"},
      body: typeof request.body === "string" ? request.body : request.body ? JSON.stringify(request.body,null,2) : "{}",
    });
  }

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-[220px_minmax(0,1fr)_220px] max-xl:grid-cols-[190px_minmax(0,1fr)] max-md:grid-cols-1">
      <div className="max-md:hidden"><CollectionsSidebar projectId={effectiveProjectId} onSelectRequest={selectRequest}/></div>
      <main className="min-w-0 overflow-y-auto p-4 lg:p-5">
        <RequestBar method={draft.method} url={draft.url} sending={execute.isPending} onMethod={(method)=>setDraft({method})} onUrl={(url)=>setDraft({url})} onSend={()=>void send()} onSave={()=>setSaveOpen(true)} onCopyCurl={()=>void copyCurl()}/>
        <div className="mt-5"><RequestTabs queryParams={draft.queryParams} headers={draft.headers} auth={draft.auth} body={draft.body} onQueryParams={(queryParams)=>setDraft({queryParams})} onHeaders={(headers)=>setDraft({headers})} onAuth={(auth)=>setDraft({auth})} onBody={(body)=>setDraft({body})}/></div>
        <div className="mt-6">
          {response && <div className="mb-3"><ResponseMeta status={response.status} latencyMs={response.latencyMs} sizeBytes={response.payloadSizeBytes}/></div>}
          <ResponseViewer response={response}/>
        </div>
      </main>
      <div className="max-xl:hidden"><HistoryPanel runs={history.data ?? []} onClear={()=>{if(effectiveProjectId)void clearHistory.mutateAsync(effectiveProjectId);}}/></div>
      <SaveRequestDialog open={saveOpen} onOpenChange={setSaveOpen} projectId={effectiveProjectId} method={draft.method} url={draft.url} queryParams={draft.queryParams} headers={draft.headers} auth={draft.auth} body={draft.body}/>
    </div>
  );
}
