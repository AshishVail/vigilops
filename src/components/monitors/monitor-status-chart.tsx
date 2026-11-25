"use client";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PingLog } from "@/lib/types/monitor";

export function MonitorStatusChart({ logs }: { logs: PingLog[] }) {
  const data = [...logs].reverse().map((log)=>({ time: new Date(log.checked_at).toISOString(), latency: log.latency_ms, status: log.status }));
  return <div className="h-64 rounded-xl border border-slate-200 bg-white p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" tickFormatter={(value:string)=>new Date(value).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} stroke="#64748b" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis stroke="#64748b" tick={{fontSize:11}} axisLine={false} tickLine={false} unit=" ms"/><Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E2E8F0",fontSize:12}} labelFormatter={(value)=>new Date(String(value)).toLocaleString()}/><Line type="monotone" dataKey="latency" stroke="#06B6D4" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>;
}
