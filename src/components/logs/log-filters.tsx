"use client";

import type { LogFilters } from "@/hooks/use-logs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function LogFilters({ value, onChange }: { value: LogFilters; onChange: (value: LogFilters) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input value={value.search ?? ""} onChange={(event)=>onChange({...value,search:event.target.value || undefined})} placeholder="Search URL, service, or message" className="font-mono text-xs"/>
      <Select value={value.service ?? ""} onChange={(event)=>onChange({...value,service:(event.target.value || undefined) as LogFilters["service"]})}>
        <option value="">All sources</option><option value="monitor">Monitor</option><option value="api">API</option><option value="security">Security</option><option value="incident">Incident</option>
      </Select>
      <Select value={value.statusGroup ?? ""} onChange={(event)=>onChange({...value,statusGroup:(event.target.value || undefined) as LogFilters["statusGroup"]})}>
        <option value="">All statuses</option><option value="2xx">2xx</option><option value="4xx">4xx</option><option value="5xx">5xx</option><option value="timeout">Timeout</option><option value="error">Error</option>
      </Select>
      <Input value={value.requestId ?? ""} onChange={(event)=>onChange({...value,requestId:event.target.value || undefined})} placeholder="Request ID" className="font-mono text-xs"/>
    </div>
  );
}
