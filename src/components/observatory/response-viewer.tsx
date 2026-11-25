"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import { CodeBlock } from "@/components/ui/code-block";
import type { ObservatoryExecutionResult } from "@/lib/observatory/executor";

export function ResponseViewer({ response }: { response: ObservatoryExecutionResult | null }) {
  if (!response) return <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-600">Send a request to inspect the response</div>;
  const prettyBody = typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2);
  const headers = JSON.stringify(response.responseHeaders, null, 2);
  const timing = JSON.stringify(response.timing, null, 2);
  return (
    <Tabs defaultValue="body">
      <div className="mb-2 flex items-center justify-between"><TabsList><TabsTrigger value="body">Body</TabsTrigger><TabsTrigger value="headers">Headers</TabsTrigger><TabsTrigger value="timing">Timing</TabsTrigger></TabsList><CopyButton value={prettyBody}/></div>
      <TabsContent value="body">{response.error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700">{response.error}</p> : <CodeBlock className="min-h-[320px]">{prettyBody || "(empty body)"}</CodeBlock>}</TabsContent>
      <TabsContent value="headers"><CodeBlock className="min-h-[320px]">{headers}</CodeBlock></TabsContent>
      <TabsContent value="timing"><CodeBlock className="min-h-[320px]">{timing}</CodeBlock></TabsContent>
    </Tabs>
  );
}
