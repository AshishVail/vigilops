"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrafficPoint } from "@/lib/analytics/traffic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Check traffic</CardTitle></CardHeader>
      <CardContent className="h-[300px]">
        {data.length === 0 ? <EmptyState title="No traffic" description="Scheduled checks will appear here." /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top:8,right:8,left:-18,bottom:0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="time" tickFormatter={(value: string) => new Date(value).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} stroke="#64748b" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis stroke="#64748b" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12}} labelFormatter={(value)=>new Date(String(value)).toLocaleString()}/>
              <Bar dataKey="checks" fill="#6366F1" radius={[4,4,0,0]} name="Checks"/>
              <Bar dataKey="errors" fill="#EF4444" radius={[4,4,0,0]} name="Errors"/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
