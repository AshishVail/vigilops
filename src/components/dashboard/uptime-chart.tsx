"use client";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { UptimePoint } from "@/lib/analytics/uptime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function UptimeChart({ data }: { data: UptimePoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
      <CardContent className="h-[300px]">
        {data.length === 0 ? <EmptyState title="No availability data" description="Uptime buckets will appear after checks run." /> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{top:8,right:8,left:-18,bottom:0}}>
              <CartesianGrid stroke="#1F2633" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="time" tickFormatter={(value:string)=>new Date(value).toLocaleDateString([], {month:"short",day:"numeric"})} stroke="#64748b" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis domain={[0,100]} stroke="#64748b" tick={{fontSize:11}} tickLine={false} axisLine={false} unit="%"/>
              <Tooltip contentStyle={{background:"#0E121A",border:"1px solid #1F2633",borderRadius:8,fontSize:12}} labelFormatter={(value)=>new Date(String(value)).toLocaleString()} formatter={(value) => [`${Number(value).toFixed(2)}%`, "Uptime"]}/>
              <Line type="stepAfter" dataKey="uptime" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{r:4,fill:"#10B981"}}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
