"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PingLog } from "@/lib/types/monitor";

export function LatencyHistogram({ logs }: { logs: PingLog[] }) {
  const buckets = [250,500,1000,2000,5000,10000];
  const data = buckets.map((limit, index) => {
    const previous = index === 0 ? 0 : buckets[index-1];
    return { range: index === buckets.length-1 ? `${previous / 1000}s+` : `≤${limit/1000}s`, count: logs.filter((log)=>log.latency_ms>previous&&log.latency_ms<=limit).length };
  });
  return <div className="h-64 rounded-xl border border-[#1F2633] bg-[#0E121A] p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#1F2633" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="range" stroke="#64748b" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis stroke="#64748b" tick={{fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#0E121A",border:"1px solid #1F2633",fontSize:12}}/><Bar dataKey="count" fill="#7C3AED" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>;
}
