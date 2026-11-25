"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LatencyPoint } from "@/lib/analytics/latency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function LatencyChart({ data }: { data: LatencyPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Response latency</CardTitle></CardHeader>
      <CardContent className="h-[300px]">
        {data.length === 0 ? <EmptyState title="No latency samples" description="Run a monitor to populate latency data." /> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="latency" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/><stop offset="95%" stopColor="#6366F1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="time" tickFormatter={(value: string) => new Date(value).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} stroke="#64748b" tick={{ fontSize:11 }} tickLine={false} axisLine={false}/>
              <YAxis stroke="#64748b" tick={{ fontSize:11 }} tickLine={false} axisLine={false} unit=" ms"/>
              <Tooltip contentStyle={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:8, fontSize:12 }} labelFormatter={(value) => new Date(String(value)).toLocaleString()} />
              <Area type="monotone" dataKey="p95" stroke="#06B6D4" strokeWidth={1.5} fill="transparent" name="P95"/>
              <Area type="monotone" dataKey="average" stroke="#6366F1" strokeWidth={2} fill="url(#latency)" name="Average"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
