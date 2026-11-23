"use client";

import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { HttpMethod } from "@/lib/types/observatory";

export function RequestBar({
  method,
  url,
  sending,
  onMethod,
  onUrl,
  onSend,
  onSave,
  onCopyCurl,
}: {
  method: HttpMethod;
  url: string;
  sending: boolean;
  onMethod: (method: HttpMethod) => void;
  onUrl: (url: string) => void;
  onSend: () => void;
  onSave: () => void;
  onCopyCurl: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={method} onChange={(event)=>onMethod(event.target.value as HttpMethod)} className="w-full font-mono sm:w-28">
        <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option>
      </Select>
      <Input value={url} onChange={(event)=>onUrl(event.target.value)} placeholder="https://api.example.com/v1/resource" className="flex-1 font-mono text-xs"/>
      <Button onClick={onSend} disabled={!url.trim() || sending}>{sending ? "Sending..." : "Send"}</Button>
      <Button variant="outline" onClick={onSave} disabled={!url.trim()}>Save</Button>
      <Button variant="ghost" onClick={onCopyCurl} disabled={!url.trim()} className="hidden lg:inline-flex">cURL</Button>
    </div>
  );
}
