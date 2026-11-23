"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyValueEditor } from "@/components/observatory/key-value-editor";
import { BodyEditor } from "@/components/observatory/body-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { DraftParam } from "@/stores/observatory-store";
import type { ApiAuth } from "@/lib/types/observatory";

export function RequestTabs({
  queryParams,
  headers,
  auth,
  body,
  onQueryParams,
  onHeaders,
  onAuth,
  onBody,
}: {
  queryParams: DraftParam[];
  headers: DraftParam[];
  auth: ApiAuth;
  body: string;
  onQueryParams: (value: DraftParam[]) => void;
  onHeaders: (value: DraftParam[]) => void;
  onAuth: (value: ApiAuth) => void;
  onBody: (value: string) => void;
}) {
  return (
    <Tabs defaultValue="params">
      <TabsList><TabsTrigger value="params">Params</TabsTrigger><TabsTrigger value="headers">Headers</TabsTrigger><TabsTrigger value="auth">Auth</TabsTrigger><TabsTrigger value="body">Body</TabsTrigger></TabsList>
      <TabsContent value="params"><KeyValueEditor value={queryParams} onChange={onQueryParams}/></TabsContent>
      <TabsContent value="headers"><KeyValueEditor value={headers} onChange={onHeaders} keyPlaceholder="Header" valuePlaceholder="Value"/></TabsContent>
      <TabsContent value="auth" className="space-y-4">
        <div className="space-y-2"><Label>Authentication</Label><Select value={auth.type} onChange={(event) => onAuth(event.target.value === "bearer" ? { type:"bearer", token:"" } : event.target.value === "api_key" ? { type:"api_key", headerName:"X-API-Key", value:"" } : { type:"none" })}><option value="none">None</option><option value="bearer">Bearer token</option><option value="api_key">API key</option></Select></div>
        {auth.type === "bearer" && <div className="space-y-2"><Label>Token</Label><Input type="password" value={auth.token} onChange={(event)=>onAuth({type:"bearer",token:event.target.value})}/></div>}
        {auth.type === "api_key" && <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Header name</Label><Input value={auth.headerName} onChange={(event)=>onAuth({...auth,headerName:event.target.value})}/></div><div className="space-y-2"><Label>Value</Label><Input type="password" value={auth.value} onChange={(event)=>onAuth({...auth,value:event.target.value})}/></div></div>}
      </TabsContent>
      <TabsContent value="body"><BodyEditor value={body} onChange={onBody}/></TabsContent>
    </Tabs>
  );
}
